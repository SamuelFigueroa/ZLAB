import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';

import AddMaintenanceEvent from './mutations/AddMaintenanceEvent';


const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
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
  }
});

const services = ['Install', 'Repair', 'Prev. Maintenance', 'Calibration', 'Decommission'];

class MaintenanceEventForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state= {
      date: '',
      service: 'Install',
      agent: '',
      scheduled: '',
      description: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  static contextTypes = {
    swipeableViews: PropTypes.object.isRequired,
  };

  componentDidUpdate() {
    setTimeout(() => this.context.swipeableViews.slideUpdateHeight(), this.props.theme.transitions.duration.shortest);
  }

  handleChange = e => {
    return this.setState({ [e.target.name] : e.target.value });
  }

  handleClose = (clearErrors, toggleForm) => () => {
    this.setState({
      date: '',
      service: 'Install',
      agent: '',
      scheduled: '',
      description: ''
    });
    clearErrors();
    return toggleForm();
  }

  handleSubmit = (addMaintenanceEvent, assetID, handleClose) => async e => {
    e.preventDefault();
    const event = { ...this.state, assetID };
    const result = await addMaintenanceEvent(event);
    if(result !== undefined) handleClose();
  }

  render() {
    const { classes, expanded, theme, assetID, toggleForm } = this.props;
    return (
      <AddMaintenanceEvent>
        { (addMaintenanceEvent, errors, clearErrors) => (
          <form className={classes.container}
            onSubmit={this.handleSubmit(addMaintenanceEvent, assetID, this.handleClose(clearErrors, toggleForm) )}
            noValidate
            autoComplete="off">
            <div className={classes.root}>
              <ExpansionPanel expanded={expanded} CollapseProps={{
                timeout: {
                  enter: 0,
                  exit: theme.transitions.duration.shortest
                }
              }}>
                <ExpansionPanelSummary onClick={toggleForm}>
                  <div className={classes.column}>
                    <Typography className={classes.heading}>Add Maintenance Event</Typography>
                  </div>
                  <div className={classes.column}>
                    <Typography className={classes.secondaryHeading}>Create a new log entry</Typography>
                  </div>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.details}>
                  <Grid
                    container
                    alignItems="flex-start"
                    spacing={16}>
                    <Grid item xs={3}>
                      <TextField
                        name="date"
                        label="Date"
                        type="date"
                        fullWidth
                        margin="normal"
                        value={this.state.date}
                        onChange={this.handleChange}
                        error={Boolean(errors.date)}
                        helperText={errors.date}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        name="service"
                        label="Select Service"
                        fullWidth
                        select
                        value={this.state.service}
                        onChange={this.handleChange}
                        margin="normal"
                      >
                        {services.map(option => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        name="agent"
                        label="Agent"
                        fullWidth
                        margin="normal"
                        value={this.state.agent}
                        onChange={this.handleChange}
                        error={Boolean(errors.agent)}
                        helperText={errors.agent}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        name="scheduled"
                        label="Next Scheduled"
                        type="date"
                        fullWidth
                        margin="normal"
                        value={this.state.scheduled}
                        onChange={this.handleChange}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="description"
                        label="Description"
                        fullWidth
                        multiline
                        margin="normal"
                        value={this.state.description}
                        onChange={this.handleChange}
                        error={Boolean(errors.description)}
                        helperText={errors.description}
                      />
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
      </AddMaintenanceEvent>
    );
  }
}

MaintenanceEventForm.propTypes = {
  classes: PropTypes.object.isRequired,
  expanded: PropTypes.bool.isRequired,
  theme: PropTypes.object.isRequired,
  assetID: PropTypes.string.isRequired,
  toggleForm: PropTypes.func.isRequired
};

export default withStyles(styles, { withTheme: true })(MaintenanceEventForm);
