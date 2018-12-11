import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import Autocomplete from '../Autocomplete';
import StructureImage from './StructureImage';

import UpdateContainer from '../mutations/UpdateContainer';
import GetContainerHints from '../queries/GetContainerHints';
import GetLocations from '../queries/GetLocations';
import GetUsers from '../queries/GetUsers';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  form: {
    padding: theme.spacing.unit * 5,
    minWidth: '550px',
    minHeight: '400px'
  },
  registerButton: {
    paddingTop: theme.spacing.unit * 2
  },
  input: {
    display: 'none',
  },
  headerSection: {
    paddingBottom: theme.spacing.unit * 2
  },
  actions: {
    paddingTop: theme.spacing.unit * 5
  },
  textField: {
    paddingBottom: theme.spacing.unit * 3
  },
  paper: {
    maxWidth: theme.spacing.unit * 50,
    maxHeight: theme.spacing.unit * 50,
    margin:'auto'
  },
  structure: {
    width: theme.spacing.unit * 40,
    height: theme.spacing.unit * 40,
    padding: theme.spacing.unit * 3,
    margin:'auto'
  },
});

const dateTimeToString = (d) => {
  const date = new Date(d);
  date.setHours(date.getHours() - (date.getTimezoneOffset() / 60));
  return date.toLocaleDateString('en-US');
};

const states = [
  { id: 'S', label: 'Solid' },
  { id: 'L', label: 'Liquid' },
  { id: 'G', label: 'Gas' },
  { id: 'Soln', label: 'Solution' },
  { id: 'Susp', label: 'Suspension' }
];

class ContainerForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      vendor: this.props.initialState.vendor,
      catalog_id: this.props.initialState.catalog_id,
      institution: this.props.initialState.institution,
      researcher: this.props.initialState.researcher,
      state: this.props.initialState.state,
      mass: this.props.initialState.mass ? this.props.initialState.mass.toString(): '',
      mass_units: this.props.initialState.mass_units ? this.props.initialState.mass_units: 'mg',
      volume: this.props.initialState.volume ? this.props.initialState.volume.toString(): '',
      vol_units: this.props.initialState.vol_units ? this.props.initialState.vol_units: 'mL',
      concentration: this.props.initialState.concentration ? this.props.initialState.concentration.toString(): '',
      conc_units: this.props.initialState.conc_units ? this.props.initialState.conc_units: 'mM',
      solvent: this.props.initialState.solvent,
      owner: this.props.initialState.owner,
      location_area: this.props.initialState.location.area.id,
      location_sub_area: this.props.initialState.location.sub_area.id,
      description: this.props.initialState.description,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleChange = e => {
    return this.setState({ [e.target.name] : e.target.value });
  }

  handleSubmit = updateContainer => async e => {
    e.preventDefault();

    const { vendor, catalog_id, institution, researcher, state,
      mass, mass_units, volume, vol_units, concentration, conc_units, solvent,
      owner, location_area: area, location_sub_area: sub_area, description } = this.state;

    let container = {
      id: this.props.initialState.id,
      content: this.props.initialState.content.id,
      eln_id: this.props.initialState.eln_id,
      barcode: this.props.initialState.barcode,
      category: this.props.initialState.category,
      state, owner, location: { area, sub_area }, description,
      mass: null, mass_units: null, volume: null, vol_units: null, concentration: null, conc_units: null, solvent: ''
    };

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

    if (this.props.initialState.vendor) {
      container.vendor = vendor;
      container.catalog_id = catalog_id;
      container.institution = '';
      container.researcher = '';
    } else {
      container.vendor = '';
      container.catalog_id = '';
      container.institution = institution;
      container.researcher = researcher;
    }

    const result = await updateContainer(container);
    if(result !== undefined)
      return this.props.history.goBack();
  }

  handleClose = (clearErrors) => () => {
    clearErrors();
    return this.props.history.goBack();
  }

  render() {

    const { classes } = this.props;
    return(
      <GetUsers>
        { users => (
          <GetLocations>
            { locations => (
              <GetContainerHints>
                { containerHints => (
                  <UpdateContainer>
                    { (updateContainer, errors, clearErrors) => (
                      <div className={classes.root}>
                        <Grid
                          container
                          justify="center"
                          alignItems="center"
                          direction="column"
                          spacing={8}>
                          <Grid item xs={12}>
                            <Typography variant="display1" gutterBottom>
                              Update Container
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Paper className={classes.form} elevation={12}>
                              <form className={classes.container}
                                onSubmit={this.handleSubmit(updateContainer)}
                                noValidate
                                autoComplete="off">
                                <Grid
                                  container
                                  alignItems="flex-start"
                                  spacing={16}>
                                  <Grid item xs={12}>
                                    <Typography className={classes.headerSection} variant="headline" color="primary" gutterBottom>
                                      Container Information
                                    </Typography>
                                  </Grid>
                                  <Grid item sm={12} lg={6}>
                                    <Grid
                                      container
                                      alignItems="flex-start"
                                      spacing={16}>
                                      <Grid item xs={12} sm={4}>
                                        <TextField
                                          className={classes.textField}
                                          name="category"
                                          label="Category"
                                          fullWidth
                                          disabled
                                          value={this.props.initialState.category}
                                          margin="none"
                                        />
                                      </Grid>
                                      <Grid item xs={12} sm={4}>
                                        <TextField
                                          className={classes.textField}
                                          name="barcode"
                                          label="Barcode"
                                          fullWidth
                                          margin="none"
                                          value={this.props.initialState.barcode}
                                          disabled
                                        />
                                      </Grid>
                                      <Grid item xs={12} sm={4}></Grid>
                                      {
                                        this.props.initialState.vendor ? (
                                          <Grid item xs={12} sm={4}>
                                            <Autocomplete
                                              options={containerHints.vendor}
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
                                          <Grid item xs={12} sm={4}>
                                            <Autocomplete
                                              options={containerHints.institution}
                                              textFieldProps={{
                                                label: 'Institution',
                                                margin: 'none',
                                                value: this.state.institution,
                                                onChange: e => this.handleChange({ target: { name: 'institution', value: e.target.value }}),
                                                error: Boolean(errors.institution),
                                                helperText: errors.institution
                                              }}>
                                            </Autocomplete>
                                          </Grid>
                                        )
                                      }
                                      {
                                        this.props.initialState.vendor ? (
                                          <Grid item xs={12} sm={4}>
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
                                          <Grid item xs={12} sm={4}>
                                            <Autocomplete
                                              options={containerHints.researcher}
                                              textFieldProps={{
                                                label: 'Researcher',
                                                margin: 'none',
                                                value: this.state.researcher,
                                                onChange: e => this.handleChange({ target: { name: 'researcher', value: e.target.value }}),
                                                error: Boolean(errors.researcher),
                                                helperText: errors.researcher
                                              }}>
                                            </Autocomplete>
                                          </Grid>
                                        )
                                      }
                                      {
                                        this.props.initialState.institution && this.props.initialState.category == 'Sample' ? (
                                          <Grid item xs={12} sm={4}>
                                            <TextField
                                              className={classes.textField}
                                              name="eln_id"
                                              label="ELN ID"
                                              fullWidth
                                              margin="none"
                                              value={this.props.initialState.eln_id}
                                              disabled
                                            />
                                          </Grid>
                                        ) : <Grid item xs={12} sm={4}></Grid>
                                      }
                                      <Grid item xs={12} sm={4}>
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
                                          <Grid item xs={12} sm={4}>
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
                                          <Grid item xs={12} sm={4}>
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
                                          <Grid item xs={12} sm={4}>
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
                                        <Grid item xs={12} sm={4}>
                                          <Autocomplete
                                            options={containerHints.solvent}
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
                                        <Grid item sm={8}></Grid> : <Grid item sm={4}></Grid>
                                      }
                                      <Grid item xs={12} sm={4}>
                                        <TextField
                                          className={classes.textField}
                                          name="location_area"
                                          label="Current Location"
                                          fullWidth
                                          select
                                          margin="none"
                                          value={this.state.location_area}
                                          onChange={e => this.setState({ location_area: e.target.value, location_sub_area: '' })}
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
                                      <Grid item xs={12} sm={4}>
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
                                      <Grid item xs={12} sm={4}>
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
                                    </Grid>
                                  </Grid>
                                  <Grid item xs={12} lg={6}>
                                    <Paper className={classes.paper} elevation={16}>
                                      <StructureImage className={classes.structure} molblock={this.props.initialState.content.molblock} />
                                    </Paper>
                                  </Grid>
                                  <Grid item xs={12}>
                                    <TextField
                                      className={classes.textField}
                                      name="description"
                                      label="Container Description"
                                      fullWidth
                                      multiline
                                      margin="none"
                                      value={this.state.description}
                                      onChange={this.handleChange}
                                      error={Boolean(errors.container_description)}
                                      helperText={errors.container_description}
                                    />
                                  </Grid>
                                </Grid>
                                <Grid
                                  container
                                  alignItems='flex-end'
                                  justify="space-between"
                                  className={classes.actions}
                                  spacing={32}>
                                  <Grid item md={3} xs={12} className={classes.registerButton}>
                                    <input type="submit" id="register-button" className={classes.input}/>
                                    <label htmlFor="register-button">
                                      <Button variant="contained"  component="span" color="primary" fullWidth>
                                        Save
                                      </Button>
                                    </label>
                                  </Grid>
                                  <Grid item md={3} xs={12}>
                                    <Button variant="contained" color="secondary" fullWidth onClick={this.handleClose(clearErrors)}>
                                      Cancel
                                    </Button>
                                  </Grid>
                                  <Grid item xs={12} md={6}>
                                    <Typography variant="subheading" color="textSecondary" align="right">
                                      <i>Edited by {this.props.user.name}  at  {dateTimeToString(new Date())}</i>
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </form>
                            </Paper>
                          </Grid>
                        </Grid>
                      </div>
                    )}
                  </UpdateContainer>
                )}
              </GetContainerHints>
            )}
          </GetLocations>
        )}
      </GetUsers>
    );
  }
}

ContainerForm.propTypes = {
  classes: PropTypes.object.isRequired,
  initialState: PropTypes.object,
  structure: PropTypes.string,
  cas: PropTypes.string,
  user: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

export default withStyles(styles)(withRouter(ContainerForm));
