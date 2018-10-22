import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import Select from './Select';
import InputAdornment from '@material-ui/core/InputAdornment';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import FilterPanel from './FilterPanel';
import FilterOptions from './FilterOptions';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3,
    width: theme.spacing.unit * 100,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxHeight: '650px',
    overflow: 'auto',
    margin: 0,

  },
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  buttons: {
    paddingTop: theme.spacing.unit * 2
  },
  input: {
    display: 'none',
  },
  details: {
    alignItems: 'center',
  },
  filterButton: {
    marginRight: theme.spacing.unit
  }
});

const formatCurrency = (n) => new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD' }).format(n);

const nestedAssign = (target, property, value) => {
  let propertyArr = property.split('.');
  if (propertyArr.length == 1)
    return target[property] = value;
  else {
    let firstElem = propertyArr.shift();
    if (!(firstElem in target))
      target[firstElem] = {};
    return nestedAssign(target[firstElem], propertyArr.join('.'), value);
  }
};

class FilterModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state={};
    let defaultFilter = JSON.parse(this.props.filter);
    Object.keys(defaultFilter).forEach(prop => this.state[prop] = defaultFilter[prop]);
    this.props.filterPanels.forEach(panel => {
      this.state[panel.id] = { expanded: false, enabled: false};
      return panel.filters.forEach( filter => {
        const { id, type, kind } = filter;
        switch (type) {
        case 'multi': {
          this.state[id] = [];
          break;
        }
        case 'single': {
          this.state[id] = [];
          break;
        }
        case 'range': {
          if(kind == 'date') {
            this.state[id] = {
              min: '',
              max: ''
            };
          } else {
            this.state[id] = {
              min: NaN,
              max: NaN
            };
            this.state[`${id}.render`] = {
              min: '',
              max: ''
            };
          }
          break;
        }
        default:
          break;
        }
      });
    });
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.togglePanel = this.togglePanel.bind(this);
    this.toggleExpansion = this.toggleExpansion.bind(this);
    this.resetFilterPanels = this.resetFilterPanels.bind(this);
    this.restoreFilterState = this.restoreFilterState.bind(this);
  }

  static contextTypes = {
    swipeableViews: PropTypes.object,
  };

  componentDidMount() {
    this.props.actions.setFilter(JSON.stringify(this.state));
  }

  componentDidUpdate() {
    if(this.context.swipeableViews !== undefined)
      setTimeout(() => this.context.swipeableViews.slideUpdateHeight(), this.props.theme.transitions.duration.shortest);
  }

  restoreFilterState = () => {
    this.setState(JSON.parse(this.props.filter));
    return this.props.onClose();
  }

  resetFilterPanels = async () => {
    let defaultState = {};
    this.props.filterPanels.forEach( panel => {
      defaultState[panel.id] = { enabled: false, expanded: false };
      return panel.filters.forEach( filter => {
        const { id, type, kind } = filter;
        switch (type) {
        case 'multi': {
          defaultState[id] = [];
          break;
        }
        case 'single': {
          defaultState[id] = [];
          break;
        }
        case 'range': {
          if(kind == 'date') {
            defaultState[id] = {
              min: '',
              max: ''
            };
          } else {
            defaultState[id] = {
              min: NaN,
              max: NaN
            };
            defaultState[`${id}.render`] = {
              min: '',
              max: ''
            };
          }
          break;
        }
        default:
          break;
        }
      });
    });
    this.setState(defaultState, async() => await this.props.actions.resetFilters(JSON.stringify(this.state)));
  }

  togglePanel = panelID => () => (
    this.setState(
      {
        [panelID]: {
          enabled: !this.state[panelID].enabled,
          expanded: !this.state[panelID].enabled
        }
      })
  );

  toggleExpansion = panel => e => {
    if(!(e.target.type == 'checkbox') && !(e.target.id == 'label'))
      this.state[panel].enabled && this.setState({ [panel]: {...this.state[panel], expanded: !this.state[panel].expanded }});
  }

  handleChange = (name, { type, kind }) => event => {
    switch (type) {
    case 'multi': {
      this.setState({ [name] : event });
      break;
    }
    case 'single': {
      this.setState({ [name] : [event] });
      break;
    }
    case 'range': {
      const extreme = event.target.name;
      const value = event.target.value;
      if(kind == 'date') {
        this.setState({ [name] : {...this.state[name], [extreme]: value }});
      } else {
        this.setState(
          {
            [`${name}.render`]: {
              ...this.state[`${name}.render`],
              [extreme]: value
            },
            [name]: {
              ...this.state[name],
              [extreme]: parseFloat(formatCurrency(parseFloat(value.replace(/,/g, ''))).slice(1).replace(/,/g, ''))
            }
          });
      }
      break;
    }
    default:
      break;
    }
  };


  syncRenderedPrice = (field, subfield) => () => {
    return this.setState({ [`${field}.render`]: {...this.state[`${field}.render`], [subfield]: (this.state[field][subfield] == null || isNaN(this.state[field][subfield])) ? '' : formatCurrency(this.state[field][subfield]).slice(1)}});
  }

  handleSubmit = async e => {
    e.preventDefault();
    let input = {};
    this.props.filterPanels.forEach( panel => {
      if (this.state[panel.id].enabled) {
        panel.filters.forEach( filter => {
          const { id, type, kind } = filter;
          switch (type) {
          case 'multi': {
            if (this.state[id].length)
              nestedAssign(input, id, this.state[id].map( option => option.value ));
            break;
          }
          case 'single': {
            if (this.state[id].length)
              nestedAssign(input, id, this.state[id][0].value);
            break;
          }
          case 'range': {
            const { min, max } = this.state[id];
            if(kind == 'date') {
              min && nestedAssign(input, `${id}.min`, min);
              max && nestedAssign(input, `${id}.max`, max);
            } else {
              !(isNaN(min) || (min === null)) && nestedAssign(input, `${id}.min`, min);
              !(isNaN(max) || (max === null)) && nestedAssign(input, `${id}.max`, max);
            }
            break;
          }
          default:
            break;
          }
        });
      }
    });
    if(Object.keys(input).length)
      await this.props.actions.filterData({category: this.state.category, ...input}, JSON.stringify(this.state));
    else {
      await this.props.actions.resetFilters(JSON.stringify(this.state));
      this.props.onClose();
    }
  }


  render() {
    const { classes, open, errors, type } = this.props;
    return(
      <FilterOptions filter={type}>
        {
          options => (
            <Modal
              open={open}
              onClose={this.restoreFilterState}
            >
              <div className={classes.root}>
                <Grid
                  container
                  justify="center"
                  alignItems="center"
                  direction="column"
                  spacing={8}>
                  <Grid item>
                    <form className={classes.container}
                      onSubmit={this.handleSubmit}
                      noValidate
                      autoComplete="off">
                      {
                        this.props.filterPanels.map( panel => (
                          <FilterPanel
                            key={panel.id}
                            expanded={this.state[panel.id].expanded}
                            enabled={this.state[panel.id].enabled}
                            toggleFilter={this.togglePanel(panel.id)}
                            toggleExpansion={this.toggleExpansion(panel.id)}
                            label={panel.label}
                          >
                            <Grid
                              container
                              alignItems="flex-start"
                              className={classes.panelForm}
                              spacing={8}>
                              {
                                panel.filters.map( filter => (
                                  filter.type == 'multi' ? (
                                    <Grid item key={filter.id} xs={filter.size}>
                                      <Select
                                        options={options[filter.id]}
                                        label={filter.label}
                                        value={this.state[filter.id]}
                                        onChange={this.handleChange(filter.id, { type: filter.type })}
                                        isMulti={true} />
                                    </Grid>
                                  ) : (
                                    filter.type == 'single' ? (
                                      <Grid item key={filter.id} xs={filter.size}>
                                        <Select
                                          options={options[filter.id]}
                                          label={filter.label}
                                          value={this.state[filter.id]}
                                          onChange={this.handleChange(filter.id, { type: filter.type })}
                                          isMulti={false} />
                                      </Grid>
                                    ) : (
                                      (filter.type == 'range' && filter.kind == 'date') ? (
                                        <Fragment key={filter.id}>
                                          <Grid item xs={filter.size}>
                                            <TextField
                                              name="min"
                                              label={filter.label.min}
                                              type="date"
                                              fullWidth
                                              margin="none"
                                              value={this.state[filter.id].min}
                                              onChange={this.handleChange(filter.id, { type: filter.type, kind: filter.kind })}
                                              error={Boolean(errors[filter.id])}
                                              helperText={errors[filter.id]}
                                              InputLabelProps={{
                                                shrink: true,
                                              }}
                                            />
                                          </Grid>
                                          <Grid item xs={filter.size}>
                                            <TextField
                                              name="max"
                                              label={filter.label.max}
                                              type="date"
                                              fullWidth
                                              margin="none"
                                              value={this.state[filter.id].max}
                                              onChange={this.handleChange(filter.id, { type: filter.type, kind: filter.kind })}
                                              error={Boolean(errors[filter.id])}
                                              helperText={errors[filter.id]}
                                              InputLabelProps={{
                                                shrink: true,
                                              }}
                                            />
                                          </Grid>
                                        </Fragment>
                                      ) : (
                                        (filter.type == 'range' && filter.kind == 'number') ? (
                                          <Fragment key={filter.id}>
                                            <Grid item xs={filter.size}>
                                              <ClickAwayListener onClickAway={this.syncRenderedPrice(filter.id, 'min')}>
                                                <TextField
                                                  name="min"
                                                  label={filter.label.min}
                                                  margin="none"
                                                  fullWidth
                                                  value={this.state[`${filter.id}.render`].min}
                                                  onChange={this.handleChange(filter.id, { type: filter.type, kind: filter.kind })}
                                                  error={Boolean(errors[filter.id])}
                                                  helperText={errors[filter.id]}
                                                  InputProps={{
                                                    startAdornment: (
                                                      <InputAdornment position="start">
                                                      $
                                                      </InputAdornment>
                                                    )
                                                  }}
                                                />
                                              </ClickAwayListener>
                                            </Grid>
                                            <Grid item xs={filter.size}>
                                              <ClickAwayListener onClickAway={this.syncRenderedPrice(filter.id, 'max')}>
                                                <TextField
                                                  name="max"
                                                  label={filter.label.max}
                                                  margin="none"
                                                  fullWidth
                                                  value={this.state[`${filter.id}.render`].max}
                                                  onChange={this.handleChange(filter.id, { type: filter.type, kind: filter.kind })}
                                                  error={Boolean(errors[filter.id])}
                                                  helperText={errors[filter.id]}
                                                  InputProps={{
                                                    startAdornment: (
                                                      <InputAdornment position="start">
                                                      $
                                                      </InputAdornment>
                                                    )
                                                  }}
                                                />
                                              </ClickAwayListener>
                                            </Grid>
                                          </Fragment>
                                        ) : null )))))}
                            </Grid>
                          </FilterPanel>
                        ))
                      }
                      <Grid
                        container
                        alignItems="center"
                        className={classes.buttons}
                        spacing={0}>
                        <Grid item xs={4}>
                          <input type="submit" id="filter-button" className={classes.input}/>
                          <label htmlFor="filter-button">
                            <Button variant="contained" className={classes.filterButton} component="span" color="primary">
                                Filter
                            </Button>
                          </label>
                          <Button variant="contained" color="secondary" onClick={this.restoreFilterState}>
                              Cancel
                          </Button>
                        </Grid>
                        <Grid item xs={8}>
                          <Button variant="contained" style={{ float: 'right'}} color="primary" onClick={async ()=> await this.resetFilterPanels()}>
                            Reset to Default
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                  </Grid>
                </Grid>
              </div>
            </Modal>
          )
        }
      </FilterOptions>
    );
  }
}

FilterModal.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  filterPanels: PropTypes.array.isRequired,
  filter: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  type: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(FilterModal);
