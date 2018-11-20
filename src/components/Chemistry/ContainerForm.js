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
import Autocomplete from '../Autocomplete';

import AddReagentContainer from '../mutations/AddReagentContainer';
import UpdateReagentContainer from '../mutations/UpdateReagentContainer';
import GetReagentHints from '../queries/GetReagentHints';
import GetLocations from '../queries/GetLocations';
import GetUsers from '../queries/GetUsers';

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

const states = [
  { id: 'S', label: 'Solid' },
  { id: 'L', label: 'Liquid' },
  { id: 'G', label: 'Gas' },
  { id: 'Soln', label: 'Solution' },
  { id: 'Susp', label: 'Suspension' }
];

class ContainerForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state= {
      containerID: '',
      source: 'Vendor',
      vendor: '',
      catalog_id: '',
      institution: '',
      chemist: '',
      state: 'S',
      mass: '',
      mass_units: 'mg',
      volume: '',
      vol_units: 'mL',
      concentration: '',
      conc_units: 'mM',
      solvent: '',
      owner: '',
      location_area: '',
      location_sub_area: '',
      description: '',
      registration_event: {
        user: this.props.user.login
      },
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  static contextTypes = {
    swipeableViews: PropTypes.object.isRequired,
  };

  componentDidMount() {
    setTimeout(() => this.context.swipeableViews.slideUpdateHeight(), 2000);
  }

  componentDidUpdate(prevProps) {
    setTimeout(() => this.context.swipeableViews.slideUpdateHeight(), this.props.theme.transitions.duration.standard);
    if(this.props.editMode && !prevProps.editMode) {
      this.setState({
        containerID: this.props.initialState.id,
        source: this.props.initialState.vendor ? 'Vendor' : 'Institution',
        vendor: this.props.initialState.vendor,
        catalog_id: this.props.initialState.catalog_id,
        institution: this.props.initialState.institution,
        chemist: this.props.initialState.chemist,
        state: this.props.initialState.state,
        mass: this.props.initialState.mass ? this.props.initialState.mass: '',
        mass_units: this.props.initialState.mass_units ? this.props.initialState.mass_units: 'mg',
        volume: this.props.initialState.volume ? this.props.initialState.volume: '',
        vol_units: this.props.initialState.mass_units ? this.props.initialState.mass_units: 'mL',
        concentration: this.props.initialState.concentration ? this.props.initialState.concentration: '',
        conc_units: this.props.initialState.conc_units ? this.props.initialState.conc_units: 'mL',
        solvent: this.props.initialState.solvent,
        owner: this.props.initialState.owner,
        location_area: this.props.initialState.location.area.id,
        location_sub_area: this.props.initialState.location.sub_area.id,
        description: this.props.initialState.description,
      });
    }
    if(prevProps.editMode && !this.props.editMode) {
      this.setState({
        containerID: '',
        source: 'Vendor',
        vendor: '',
        catalog_id: '',
        institution: '',
        chemist: '',
        state: 'S',
        mass: '',
        mass_units: 'mg',
        volume: '',
        vol_units: 'mL',
        concentration: '',
        conc_units: 'mM',
        solvent: '',
        owner: '',
        location_area: '',
        location_sub_area: '',
        description: '',
      });
    }
  }

  handleChange = e => {
    return this.setState({ [e.target.name] : e.target.value });
  }

  handleClose = (clearErrors, toggleForm) => () => {
    this.setState({
      containerID: '',
      source: 'Vendor',
      vendor: '',
      catalog_id: '',
      institution: '',
      chemist: '',
      state: 'S',
      mass: '',
      mass_units: 'mg',
      volume: '',
      vol_units: 'mL',
      concentration: '',
      conc_units: 'mM',
      solvent: '',
      owner: '',
      location_area: '',
      location_sub_area: '',
      description: '',
    });
    clearErrors();
    return toggleForm();
  }

  handleSubmit = (callAction, reagentID, handleClose) => async e => {
    e.preventDefault();

    const { containerID, vendor, catalog_id, institution, chemist, state, registration_event,
      mass, mass_units, volume, vol_units, concentration, conc_units, solvent,
      owner, location_area: area, location_sub_area: sub_area, description } = this.state;

    let container = { reagentID, state, owner, location: { area, sub_area }, description, solvent: '' };

    if (state == 'S') {
      container.mass = parseFloat(mass.replace(/,/g, ''));
      container.mass_units = mass_units;
    } else {
      container.volume = parseFloat(volume.replace(/,/g, ''));
      container.vol_units = vol_units;
      if ( state == 'Soln' || state == 'Susp') {
        container.concentration = parseFloat(concentration.replace(/,/g, ''));
        container.conc_units = conc_units;
        container.solvent = solvent;
      }
    }

    if (this.state.source == 'Vendor') {
      container.vendor = vendor;
      container.catalog_id = catalog_id;
      container.institution = '';
      container.chemist = '';
    } else {
      container.vendor = '';
      container.catalog_id = '';
      container.institution = institution;
      container.chemist = chemist;
    }

    if (this.props.editMode)
      container.containerID = containerID;
    else {
      container.registration_event = registration_event;
    }
    const result = await callAction(container);
    if(result !== undefined) handleClose();
  }

  render() {
    const { classes, expanded, theme, reagentID, toggleForm, editMode } = this.props;
    const Action = editMode ? UpdateReagentContainer : AddReagentContainer;
    return (
      <GetUsers>
        { users => (
          <GetLocations>
            { locations => (
              <GetReagentHints>
                { reagentHints => (
                  <Action>
                    { (callAction, errors, clearErrors) => (
                      <form className={classes.container}
                        onSubmit={this.handleSubmit(callAction, reagentID, this.handleClose(clearErrors, toggleForm) )}
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
                                <Typography className={classes.heading}>
                                  {`${ editMode ? 'Edit' : 'Add' } Reagent Container`}
                                </Typography>
                              </div>
                              <div className={classes.column}>
                                <Typography className={classes.secondaryHeading}>
                                  {editMode ? 'Update container entry' : 'Create a new container entry' }
                                </Typography>
                              </div>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails className={classes.details}>
                              <Grid
                                container
                                alignItems="flex-start"
                                spacing={16}>
                                <Grid item xs={12} sm={3}>
                                  <TextField
                                    className={classes.textField}
                                    name="source"
                                    label="Select Source"
                                    fullWidth
                                    select
                                    value={this.state.source}
                                    onChange={this.handleChange}
                                    margin="none"
                                  >
                                    {['Vendor', 'Institution'].map( source => (
                                      <MenuItem key={source} value={source}>
                                        {source}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                </Grid>
                                {
                                  this.state.source == 'Vendor' ? (
                                    <Grid item xs={12} sm={3}>
                                      <Autocomplete
                                        options={reagentHints.containers.vendor}
                                        textFieldProps={{
                                          name: 'vendor',
                                          label: 'Vendor',
                                          margin: 'none',
                                          value: this.state.vendor,
                                          onChange: this.handleChange,
                                          error: Boolean(errors.vendor),
                                          helperText: errors.vendor
                                        }}>
                                      </Autocomplete>
                                    </Grid>
                                  ) : (
                                    <Grid item xs={12} sm={3}>
                                      <Autocomplete
                                        options={reagentHints.containers.institution}
                                        textFieldProps={{
                                          name: 'institution',
                                          label: 'Institution',
                                          margin: 'none',
                                          value: this.state.institution,
                                          onChange: this.handleChange,
                                          error: Boolean(errors.institution),
                                          helperText: errors.institution
                                        }}>
                                      </Autocomplete>
                                    </Grid>
                                  )
                                }
                                {
                                  this.state.source == 'Vendor' ? (
                                    <Grid item xs={12} sm={3}>
                                      <TextField
                                        className={classes.textField}
                                        name="catalog_id"
                                        label="Catalog No."
                                        fullWidth
                                        margin="none"
                                        value={this.state.catalog_id}
                                        onChange={this.handleChange}
                                        error={Boolean(errors.catalog_id)}
                                        helperText={errors.catalog_id}
                                      />
                                    </Grid>
                                  ) : (
                                    <Grid item xs={12} sm={3}>
                                      <Autocomplete
                                        options={reagentHints.containers.chemist}
                                        textFieldProps={{
                                          name: 'chemist',
                                          label: 'Chemist',
                                          margin: 'none',
                                          value: this.state.chemist,
                                          onChange: this.handleChange,
                                          error: Boolean(errors.chemist),
                                          helperText: errors.chemist
                                        }}>
                                      </Autocomplete>
                                    </Grid>
                                  )
                                }
                                <Grid item md={3}></Grid>
                                <Grid item xs={12} sm={3}>
                                  <TextField
                                    className={classes.textField}
                                    name="state"
                                    label="Physical State"
                                    fullWidth
                                    margin="none"
                                    value={this.state.state}
                                    onChange={this.handleChange}
                                    error={Boolean(errors.state)}
                                    helperText={errors.state}
                                    select
                                  >
                                    {states.map(s => (
                                      <MenuItem key={s.id} value={s.id}>
                                        {s.label}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                </Grid>
                                {
                                  this.state.state == 'S' ? (
                                    <Grid item xs={12} sm={3}>
                                      <Grid
                                        container
                                        alignItems="flex-start"
                                      >
                                        <Grid item xs={8}>
                                          <TextField
                                            className={classes.textField}
                                            name="mass"
                                            label="Mass"
                                            fullWidth
                                            margin="none"
                                            value={this.state.mass}
                                            onChange={this.handleChange}
                                            error={Boolean(errors.mass)}
                                            helperText={errors.mass}
                                          />
                                        </Grid>
                                        <Grid item xs={4}>
                                          <TextField
                                            className={classes.textField}
                                            name="mass_units"
                                            label="Units"
                                            fullWidth
                                            margin="none"
                                            value={this.state.mass_units}
                                            onChange={this.handleChange}
                                            select
                                          >
                                            {['kg', 'g', 'mg', 'ug'].map(u => (
                                              <MenuItem key={u} value={u}>
                                                {u}
                                              </MenuItem>
                                            ))}
                                          </TextField>
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                  ) : (
                                    <Grid item xs={12} sm={3}>
                                      <Grid
                                        container
                                        alignItems="flex-start"
                                      >
                                        <Grid item xs={8}>
                                          <TextField
                                            className={classes.textField}
                                            name="volume"
                                            label="Volume"
                                            fullWidth
                                            margin="none"
                                            value={this.state.volume}
                                            onChange={this.handleChange}
                                            error={Boolean(errors.volume)}
                                            helperText={errors.volume}
                                          />
                                        </Grid>
                                        <Grid item xs={4}>
                                          <TextField
                                            className={classes.textField}
                                            name="vol_units"
                                            label="Units"
                                            fullWidth
                                            margin="none"
                                            value={this.state.vol_units}
                                            onChange={this.handleChange}
                                            select
                                          >
                                            {['L', 'mL', 'uL', 'nL'].map(u => (
                                              <MenuItem key={u} value={u}>
                                                {u}
                                              </MenuItem>
                                            ))}
                                          </TextField>
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                  )
                                }
                                {
                                  (this.state.state == 'Soln' || this.state.state == 'Susp') ? (
                                    <Grid item xs={12} sm={3}>
                                      <Grid
                                        container
                                        alignItems="flex-start"
                                      >
                                        <Grid item xs={8}>
                                          <TextField
                                            className={classes.textField}
                                            name="concentration"
                                            label="Concentration"
                                            fullWidth
                                            margin="none"
                                            value={this.state.concentration}
                                            onChange={this.handleChange}
                                            error={Boolean(errors.concentration)}
                                            helperText={errors.concentration}
                                          />
                                        </Grid>
                                        <Grid item xs={4}>
                                          <TextField
                                            className={classes.textField}
                                            name="conc_units"
                                            label="Units"
                                            fullWidth
                                            margin="none"
                                            value={this.state.conc_units}
                                            onChange={this.handleChange}
                                            select
                                          >
                                            {['M', 'mM', 'uM', 'nM'].map(u => (
                                              <MenuItem key={u} value={u}>
                                                {u}
                                              </MenuItem>
                                            ))}
                                          </TextField>
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                  ) : null
                                }
                                { (this.state.state == 'Soln' || this.state.state == 'Susp') ? (
                                  <Grid item xs={12} sm={3}>
                                    <Autocomplete
                                      options={reagentHints.containers.solvent}
                                      className={classes.textField}
                                      textFieldProps={{
                                        name: 'solvent',
                                        label: 'Solvent',
                                        margin: 'none',
                                        value: this.state.solvent,
                                        onChange: this.handleChange,
                                        error: Boolean(errors.solvent),
                                        helperText: errors.solvent
                                      }}>
                                    </Autocomplete>
                                  </Grid>
                                ) : null
                                }
                                { (this.state.state == 'Soln' || this.state.state == 'Susp') ?
                                  null : <Grid item md={6}></Grid>
                                }
                                <Grid item xs={12} sm={3}>
                                  <TextField
                                    className={classes.textField}
                                    name="location_area"
                                    label="Current Location"
                                    fullWidth
                                    select
                                    margin="none"
                                    value={this.state.location_area}
                                    onChange={this.handleChange}
                                    error={Boolean(errors.location_area)}
                                    helperText={errors.location_area}
                                  >
                                    {locations.map(location => (
                                      <MenuItem key={location.id} value={location.id}>
                                        {location.area.name}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                  <TextField
                                    className={classes.textField}
                                    name="location_sub_area"
                                    label="Area Within Location"
                                    fullWidth
                                    select
                                    margin="none"
                                    value={this.state.location_sub_area}
                                    onChange={this.handleChange}
                                    error={Boolean(errors.location_sub_area)}
                                    helperText={errors.location_sub_area}
                                  >
                                    {
                                      this.state.location_area ? (
                                        locations.find(location => location.id === this.state.location_area).area.sub_areas.map(sub_area => (
                                          <MenuItem key={sub_area.id} value={sub_area.id}>
                                            {sub_area.name}
                                          </MenuItem>
                                        ))) : (
                                        <MenuItem value=''></MenuItem>
                                      )}
                                  </TextField>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                  <TextField
                                    className={classes.textField}
                                    name="owner"
                                    label="Owner"
                                    fullWidth
                                    margin="none"
                                    value={this.state.owner}
                                    onChange={this.handleChange}
                                    error={Boolean(errors.owner)}
                                    helperText={errors.owner}
                                    select
                                  >
                                    { users.map(user => (
                                      <MenuItem key={user.id} value={user.id}>
                                        {user.name}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                </Grid>
                                <Grid item xs={12} >
                                  <TextField
                                    className={classes.textField}
                                    name="description"
                                    label="Container Description"
                                    fullWidth
                                    multiline
                                    margin="none"
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
                  </Action>
                )}
              </GetReagentHints>
            )}
          </GetLocations>
        )}
      </GetUsers>
    );
  }
}

ContainerForm.propTypes = {
  classes: PropTypes.object.isRequired,
  expanded: PropTypes.bool.isRequired,
  theme: PropTypes.object.isRequired,
  reagentID: PropTypes.string.isRequired,
  toggleForm: PropTypes.func.isRequired,
  initialState: PropTypes.object,
  editMode: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(ContainerForm);
