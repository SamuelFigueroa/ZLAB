import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Autocomplete from '../Autocomplete';

import AddLocation from '../mutations/AddLocation';
import UpdateLocation from '../mutations/UpdateLocation';
import GetLocations from '../queries/GetLocations';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 3,
  },
  input: {
    display: 'none',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  icon: {
    verticalAlign: 'bottom',
    height: 20,
    width: 20,
  },
  details: {
    alignItems: 'center',
  },
  column: {
    flexBasis: '33.33%',
  },
  helper: {
    borderLeft: `2px solid ${theme.palette.divider}`,
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  panelButton: {
    float: 'left'
  },
  panelActions: {
    padding: theme.spacing.unit * 3
  },
  textField: {
    paddingBottom: theme.spacing.unit * 3,
  },
});


class LocationForm extends Component {
  constructor(props) {
    super(props);
    this.state= {
      locationID: '',
      subAreaID: '',
      area: '',
      sub_area: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  componentDidUpdate(prevProps) {
    if(this.props.editMode && !prevProps.editMode) {
      this.setState({
        locationID: this.props.initialState.locationID,
        subAreaID: this.props.initialState.subAreaID,
        area: this.props.initialState.area,
        sub_area: this.props.initialState.sub_area
      });
    }
    if(prevProps.editMode && !this.props.editMode) {
      this.setState({
        locationID: '',
        subAreaID: '',
        area: '',
        sub_area: ''
      });
    }
  }

  handleChange = e => {
    return this.setState({ [e.target.name] : e.target.value });
  }

  handleClose = (clearErrors, toggleForm) => () => {
    this.setState({
      locationID: '',
      subAreaID: '',
      area: '',
      sub_area: ''
    });
    clearErrors();
    return toggleForm();
  }

  handleSubmit = (callAction, handleClose) => async e => {
    e.preventDefault();
    const { locationID, subAreaID, ...locationInput } = this.state;
    const input = { ...locationInput };
    if (this.props.editMode) {
      input.locationID = locationID;
      input.subAreaID = subAreaID;
    }
    const result = await callAction(input);
    if(result !== undefined) handleClose();
  }

  render() {
    const { classes, expanded, theme, toggleForm, editMode } = this.props;
    const Action = editMode ? UpdateLocation : AddLocation;
    return (
      <GetLocations>
        { locations => (
          <Action>
            { (callAction, errors, clearErrors) => (
              <form className={classes.container}
                onSubmit={this.handleSubmit(callAction, this.handleClose(clearErrors, toggleForm) )}
                noValidate
                autoComplete="off">
                <div className={classes.root}>
                  <ExpansionPanel expanded={expanded} CollapseProps={{
                    timeout: {
                      enter: 0,
                      exit: theme.transitions.duration.shortest
                    },
                    style: {
                      overflow: expanded ? 'visible' : 'auto'
                    }
                  }}>
                    <ExpansionPanelSummary onClick={toggleForm}>
                      <div className={classes.column}>
                        <Typography className={classes.heading}>
                          {`${ editMode ? 'Edit' : 'Add' } Location`}
                        </Typography>
                      </div>
                      <div className={classes.column}>
                        <Typography className={classes.secondaryHeading}>
                          {editMode ? 'Update location' : 'Create a new location entry' }
                        </Typography>
                      </div>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className={classes.details}>
                      <Grid
                        container
                        alignItems="flex-start"
                        spacing={16}>
                        <Grid item xs={6}>
                          <Autocomplete
                            className={classes.textField}
                            options={locations.map(loc => loc.area.name).filter(l=>l !== 'UNASSIGNED')}
                            textFieldProps={{
                              name: 'area',
                              label: 'Area',
                              margin: 'none',
                              value: this.state.area,
                              onChange: this.handleChange,
                              error: Boolean(errors.area),
                              helperText: errors.area
                            }}>
                          </Autocomplete>
                        </Grid>
                        <Grid item xs={6}>
                          <Autocomplete
                            className={classes.textField}
                            options={ this.state.area && locations.find(location => location.area.name === this.state.area) ?
                              locations.find(location => location.area.name === this.state.area).area.sub_areas.map(sub_area =>sub_area.name).filter(s=>s !== 'UNASSIGNED')
                              : []}
                            textFieldProps={{
                              name: 'sub_area',
                              label: 'Sub Area',
                              margin: 'none',
                              value: this.state.sub_area,
                              onChange: this.handleChange,
                              error: Boolean(errors.sub_area),
                              helperText: errors.sub_area
                            }}>
                          </Autocomplete>
                        </Grid>
                      </Grid>
                    </ExpansionPanelDetails>
                    <Divider />
                    <ExpansionPanelActions>
                      <Grid
                        container
                        justify="flex-start"
                        alignItems="center"
                        spacing={16}>
                        <Grid item>
                          <input type="submit" id="register-button" className={classes.input}/>
                          <label htmlFor="register-button">
                            <Button variant="contained" color="primary" component="span">
                              Save
                            </Button>
                          </label>
                        </Grid>
                        <Grid item>
                          <Button variant="contained" color="secondary" onClick={this.handleClose(clearErrors, toggleForm)}>
                            Cancel
                          </Button>
                        </Grid>
                      </Grid>
                    </ExpansionPanelActions>
                  </ExpansionPanel>
                </div>
              </form>
            )}
          </Action>
        )}
      </GetLocations>
    );
  }
}

LocationForm.propTypes = {
  classes: PropTypes.object.isRequired,
  expanded: PropTypes.bool.isRequired,
  theme: PropTypes.object.isRequired,
  toggleForm: PropTypes.func.isRequired,
  initialState: PropTypes.object,
  editMode: PropTypes.bool.isRequired
};

export default withStyles(styles, { withTheme: true })(LocationForm);
