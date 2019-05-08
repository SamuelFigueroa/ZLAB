import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import FilterListIcon from '@material-ui/icons/FilterList';
import Tooltip from '@material-ui/core/Tooltip';
import Select from './Select';

const styles = theme => ({
  appBar: {
    position: 'relative',
    marginBottom: theme.spacing.unit
  },
  flex: {
    flex: 1,
  },
  filterGroup: {
    padding: theme.spacing.unit
  },
  filterGroupLabel: {
    paddingTop: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 2
  },
  divider: {
    marginTop: theme.spacing.unit * 2,
    padding: '4px',
    backgroundColor: theme.palette.primary.light
  },
  input: {
    display: 'none',
  },
  resetButton: {
    marginRight: theme.spacing.unit * 3,
    borderColor: 'white'
  }
});

const formatCurrency = n => new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD' }).format(n);
const getCurrencyValue = n => {
  const f = parseFloat(n.replace(/,/g, ''));
  if(isNaN(f) || !(f>0))
    return '';
  return formatCurrency(f).slice(1).replace(/,/g, '');
};
class TableFilterDialog extends Component {
  constructor(props) {
    super(props);
    let state = {};
    this.props.filterGroups.forEach(group => {
      group.filters.forEach(filter => {
        const { key, type } = filter;
        const value = this.props.value[key];
        if(type == 'Multi' || type == 'Single')
          state[key] = value.map(v=>({ value: v[0], label: v[1] }));
        else {
          state[key] = value;
        }
      });
    });
    this.state = state;
    this.handleCurrencyRangeChange = this.handleCurrencyRangeChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.timeoutID=null;
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutID);
  }

  handleReset = async () => {
    const { __typename } = this.props.value;
    const filters = Object.fromEntries(this.props.filterGroups.map(group=>group.filters).reduce((acc, curr)=>acc.concat(curr)).map(f=>[f.key, f.type]));

    const input = Object.fromEntries(Object.entries(this.state).map(filter => {
      let value = [];
      switch (filters[filter[0]]) {
      case 'DateRange': {
        value = ['',''];
        break;
      }
      case 'MeasurementRange': {
        value = ['','','',''];
        break;
      }
      case 'CurrencyRange': {
        value = ['',''];
        break;
      }
      default:
        break;
      }
      return [filter[0], value];
    }
    ));
    await this.props.onReset({ __typename, ...input }, this.props.refetch);
    this.setState(input);
  };

  handleCurrencyRangeChange = (key, value) => {
    this.setState({ [key]: value }, () => {
      if (this.timeoutID)
        clearTimeout(this.timeoutID);
      this.timeoutID = setTimeout(
        () => {
          this.setState({ [key]: value.map(v=>getCurrencyValue(v)) });
          this.timeoutID = null;
        }, 3000);
    });
  }

  handleSubmit = async () => {
    const { __typename } = this.props.value;
    const filters = Object.fromEntries(this.props.filterGroups.map(group=>group.filters).reduce((acc, curr)=>acc.concat(curr)).map(f=>[f.key, f.type]));

    const input = Object.fromEntries(Object.entries(this.state).map(filter=>[
      filter[0],
      (filters[filter[0]] == 'Multi' || filters[filter[0]] == 'Single') ? filter[1].map(f=>[f.value, f.label]) :
        (filters[filter[0]] == 'CurrencyRange' ? filter[1].map(num=>getCurrencyValue(num)) : filter[1])
    ]));
    await this.props.onSubmit({ __typename, ...input }, this.props.refetch, this.props.onClose);
  }

  render () {
    const { classes, filterGroups, errors, onClose, options } = this.props;
    return (
      <div>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Tooltip title="Save Filter">
              <IconButton color="inherit" aria-label="Filter" onClick={this.handleSubmit}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <div className={classes.flex}>
            </div>
            <Button className={classes.resetButton} variant="outlined" color="inherit" onClick={this.handleReset}>
              Clear Filter
            </Button>
            <IconButton color="inherit" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        {
          filterGroups.map( group => (
            <div className={classes.filterGroup} key={group.key}>
              <Typography className={classes.filterGroupLabel} id="label" variant="subheading" color="primary">
                {group.label}
              </Typography>
              <List>
                {
                  group.filters.map( filter => (
                    filter.type == 'Multi' ? (
                      <ListItem key={filter.key}>
                        <Select
                          options={options[filter.path]}
                          label={filter.label}
                          value={this.state[filter.key]}
                          onChange={e =>this.setState({ [filter.key]: e })}
                          isMulti={true} />
                      </ListItem>
                    ) : (
                      filter.type == 'Single' ? (
                        <ListItem key={filter.key}>
                          <Select
                            options={options[filter.path]}
                            label={filter.label}
                            value={this.state[filter.key]}
                            onChange={e =>this.setState({ [filter.key]: [e] })}
                            isMulti={false} />
                        </ListItem>
                      ) : (
                        (filter.type == 'DateRange') ? (
                          <ListItem key={filter.key}>
                            <Grid container spacing={8}>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  name="min"
                                  label={`${filter.label} (From)`}
                                  type="date"
                                  fullWidth
                                  margin="none"
                                  value={this.state[filter.key][0]}
                                  onChange={e =>this.setState({
                                    [filter.key]: [e.target.value, this.state[filter.key][1]],
                                  })}
                                  error={Boolean(errors[filter.path])}
                                  helperText={errors[filter.path]}
                                  InputLabelProps={{
                                    shrink: true,
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  name="max"
                                  label={`${filter.label} (To)`}
                                  type="date"
                                  fullWidth
                                  margin="none"
                                  value={this.state[filter.key][1]}
                                  onChange={e =>this.setState({
                                    [filter.key]: [this.state[filter.key][0], e.target.value],
                                  })}
                                  error={Boolean(errors[filter.path])}
                                  helperText={errors[filter.path]}
                                  InputLabelProps={{
                                    shrink: true,
                                  }}
                                />
                              </Grid>
                            </Grid>
                          </ListItem>
                        ) : (
                          (filter.type == 'CurrencyRange') ? (
                            <ListItem key={filter.key}>
                              <Grid container spacing={8}>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    name="min"
                                    label={`Min. ${filter.label}`}
                                    margin="none"
                                    fullWidth
                                    value={this.state[filter.key][0]}
                                    onChange={e =>
                                      this.handleCurrencyRangeChange(
                                        filter.key,
                                        [e.target.value, this.state[filter.key][1]]
                                      )
                                    }
                                    error={Boolean(errors[filter.path])}
                                    helperText={errors[filter.path]}
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                        $
                                        </InputAdornment>
                                      )
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    name="max"
                                    label={`Max. ${filter.label}`}
                                    margin="none"
                                    fullWidth
                                    value={this.state[filter.key][1]}
                                    onChange={e =>
                                      this.handleCurrencyRangeChange(
                                        filter.key,
                                        [this.state[filter.key][0], e.target.value]
                                      )
                                    }
                                    error={Boolean(errors[filter.path])}
                                    helperText={errors[filter.path]}
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                        $
                                        </InputAdornment>
                                      )
                                    }}
                                  />
                                </Grid>
                              </Grid>
                            </ListItem>
                          ) : (
                            (filter.type == 'MeasurementRange') ? (
                              <ListItem key={filter.key}>
                                <Grid container spacing={8}>
                                  <Grid item xs={12} sm={6}>
                                    <Grid
                                      container
                                      alignItems="flex-start"
                                    >
                                      <Grid item xs={8}>
                                        <TextField
                                          name="min"
                                          label={`Min. ${filter.label}`}
                                          fullWidth
                                          margin="none"
                                          value={this.state[filter.key][0]}
                                          onChange={e =>this.setState({
                                            [filter.key]: [e.target.value, this.state[filter.key][1], this.state[filter.key][2], this.state[filter.key][3]],
                                          })}
                                          error={Boolean(errors[filter.path])}
                                          helperText={errors[filter.path]}
                                        />
                                      </Grid>
                                      <Grid item xs={4}>
                                        <TextField
                                          name="min"
                                          label="Units"
                                          fullWidth
                                          margin="none"
                                          value={this.state[filter.key][1]}
                                          onChange={e =>this.setState({
                                            [filter.key]: [this.state[filter.key][0], e.target.value, this.state[filter.key][2], this.state[filter.key][3]],
                                          })}
                                          select
                                        >
                                          {options[filter.units].map(u => (
                                            <MenuItem key={u} value={u}>
                                              {u}
                                            </MenuItem>
                                          ))}
                                        </TextField>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <Grid
                                      container
                                      alignItems="flex-start"
                                    >
                                      <Grid item xs={8}>
                                        <TextField
                                          name="max"
                                          label={`Max. ${filter.label}`}
                                          fullWidth
                                          margin="none"
                                          value={this.state[filter.key][2]}
                                          onChange={e =>this.setState({
                                            [filter.key]: [this.state[filter.key][0], this.state[filter.key][1], e.target.value, this.state[filter.key][3]],
                                          })}
                                          error={Boolean(errors[filter.path])}
                                          helperText={errors[filter.path]}
                                        />
                                      </Grid>
                                      <Grid item xs={4}>
                                        <TextField
                                          name="max"
                                          label="Units"
                                          fullWidth
                                          margin="none"
                                          value={this.state[filter.key][3]}
                                          onChange={e =>this.setState({
                                            [filter.key]: [this.state[filter.key][0], this.state[filter.key][1], this.state[filter.key][2], e.target.value],
                                          })}
                                          select
                                        >
                                          {options[filter.units].map(u => (
                                            <MenuItem key={u} value={u}>
                                              {u}
                                            </MenuItem>
                                          ))}
                                        </TextField>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </ListItem>
                            ) : null))))))}
              </List>
              <Divider className={classes.divider}/>
            </div>
          ))}
      </div>
    );
  }
}

TableFilterDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  value: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
  filterGroups: PropTypes.array.isRequired,
  errors: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired
};

export default withStyles(styles)(TableFilterDialog);
