import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import MenuItem from '@material-ui/core/MenuItem';
import Autocomplete from '../Autocomplete';
import Select from '../Select';
import StructureEditor from './StructureEditor';
import StructureImage from './StructureImage';

import AddCompound from '../mutations/AddCompound';
import UpdateCompound from '../mutations/UpdateCompound';
import GetCompoundHints from '../queries/GetCompoundHints';
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
  addButton: {
    padding: '4px',
    marginBottom: theme.spacing.unit * 3,
    minHeight: '26px',
    minWidth: '26px',
    marginLeft: theme.spacing.unit
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

class CompoundForm extends Component {
  constructor(props) {
    super(props);
    if(this.props.initialState) {
      this.state = {
        name: this.props.initialState.name,
        molblock: this.props.initialState.molblock,
        cas: this.props.initialState.cas,
        description: this.props.initialState.description,
        attributes: this.props.initialState.attributes,
        storage: this.props.initialState.storage,

        new_attribute: '',
        added_attributes: [],
        new_flag: '',
      };
    } else {
      this.state={
        name: '',
        molblock: '',
        cas: this.props.cas !== undefined ? this.props.cas : '',
        description: '',
        attributes: [],
        storage: '',
        registration_event: {
          user: this.props.user.login
        },

        category: 'Reagent',
        barcode: '',
        source: 'Vendor',
        vendor: '',
        catalog_id: '',
        institution: '',
        researcher: '',
        eln_id: '',
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
        container_description: '',

        new_attribute: '',
        added_attributes: [],
        new_flag: '',
      };
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.addOption = this.addOption.bind(this);
  }

  handleChange = e => {
    return this.setState({ [e.target.name] : e.target.value });
  }

  handleSubmit = callAction => e => {
    e.preventDefault();
    const { name, molblock, cas, description, attributes, storage } = this.state;

    let input = {
      name, cas: cas.trim(), description, storage, attributes
    };
    if (this.props.initialState)
      input.id = this.props.initialState.id;
    else {
      input.molblock = molblock;
      const { category, barcode, vendor, catalog_id, institution, researcher, eln_id, state, registration_event,
        mass, mass_units, volume, vol_units, concentration, conc_units, solvent,
        owner, location_area: area, location_sub_area: sub_area, container_description } = this.state;

      let container = {
        barcode: '', eln_id: '', category, state, owner, location: { area, sub_area }, registration_event, description: container_description,
        mass: null, mass_units: null, volume: null, vol_units: null, concentration: null, conc_units: null, solvent: '' };

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
        container.researcher = '';
      } else {
        container.vendor = '';
        container.catalog_id = '';
        container.institution = institution;
        container.researcher = researcher;
      }

      if (category == 'Sample') {
        container.barcode = barcode;
        if (this.state.source == 'Institution')
          container.eln_id = eln_id;
      }

      input.container = container;
      input.registration_event = registration_event;
    }
    return callAction(input);
  }

  handleClose = (clearErrors) => () => {
    clearErrors();
    return this.props.history.goBack();
  }

  addOption = ({ fields, hints }) => () => {
    const { option, options, added_options } = fields;
    const newOption = this.state[option].trim().toLowerCase();
    if (newOption.length) {
      if(hints.concat(this.state[added_options]).indexOf(newOption) == -1) {
        return this.setState({
          [options]: this.state[options].concat(newOption),
          [added_options]: this.state[added_options].concat(newOption),
          [option]: ''
        });
      } else {
        return this.setState({
          [options]: Array.from(new Set(this.state[options].concat(newOption))),
          [option]: ''
        });
      }
    }

  }

  render() {

    const { classes } = this.props;
    const update = this.props.initialState ? true : false;
    const Action = update ? UpdateCompound : AddCompound;
    return(
      <GetUsers>
        { users => (
          <GetLocations>
            { locations => (
              <GetCompoundHints>
                { compoundHints => (
                  <GetContainerHints>
                    { containerHints => (
                      <Action>
                        { (callAction, errors, clearErrors) => (
                          <div className={classes.root}>
                            <Grid
                              container
                              justify="center"
                              alignItems="center"
                              direction="column"
                              spacing={8}>
                              <Grid item xs={12}>
                                <Typography variant="h4" gutterBottom>
                                  { `${update ? 'Edit' : 'Register'} Reagent/Sample` }
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Paper className={classes.form} elevation={12}>
                                  <form className={classes.container}
                                    onSubmit={this.handleSubmit(callAction)}
                                    noValidate
                                    autoComplete="off">
                                    <Grid
                                      container
                                      alignItems="flex-start"
                                      spacing={16}>
                                      <Grid item xs={12}>
                                        <Typography className={classes.headerSection} variant="h5" color="primary" gutterBottom>
                                          Chemical Information
                                        </Typography>
                                      </Grid>
                                      <Grid item sm={12} lg={6}>
                                        <Grid
                                          container
                                          alignItems="flex-start"
                                          spacing={16}>
                                          <Grid item xs={12} sm={6}>
                                            <TextField
                                              className={classes.textField}
                                              name="name"
                                              label="Compound Name (optional)"
                                              fullWidth
                                              margin="none"
                                              value={this.state.name}
                                              onChange={this.handleChange}
                                              error={Boolean(errors.name)}
                                              helperText={errors.name}
                                            />
                                          </Grid>
                                          <Grid item xs={12} sm={6}>
                                            <TextField
                                              className={classes.textField}
                                              name="cas"
                                              label="CAS No. (optional)"
                                              fullWidth
                                              margin="none"
                                              value={this.state.cas}
                                              onChange={this.handleChange}
                                              error={Boolean(errors.cas)}
                                              helperText={errors.cas}
                                            />
                                          </Grid>
                                          <Grid item xs={12} sm={6}>
                                            <Select
                                              className={classes.textField}
                                              options={compoundHints.attributes.concat(this.state.added_attributes).map(a => ({ label: a, value: a }))}
                                              label="Chemical Attributes"
                                              value={this.state.attributes.map(a => ({ label: a, value: a }))}
                                              onChange={e=>this.handleChange({ target: {name: 'attributes', value: e.map(({value})=>value)}})}
                                              isMulti={true}
                                            />
                                          </Grid>
                                          <Grid item xs={12} sm={6}>
                                            <Grid
                                              container
                                              alignItems="flex-end"
                                            >
                                              <Grid item xs={10}>
                                                <TextField
                                                  className={classes.textField}
                                                  name="new_attribute"
                                                  label="Add an attribute"
                                                  fullWidth
                                                  margin="none"
                                                  value={this.state.new_attribute}
                                                  onChange={this.handleChange}
                                                />
                                              </Grid>
                                              <Grid item xs={2}>
                                                <Button
                                                  onClick={this.addOption({
                                                    fields: { options: 'attributes', added_options: 'added_attributes', option: 'new_attribute'},
                                                    hints: compoundHints.attributes,
                                                  })}
                                                  variant="contained" mini color="primary"
                                                  aria-label="Add attribute"
                                                  disabled={!this.state.new_attribute.trim().length}
                                                  classes={{ root: classes.addButton}}
                                                >
                                                  <AddIcon />
                                                </Button>
                                              </Grid>
                                            </Grid>
                                          </Grid>
                                          <Grid item xs={12}>
                                            <Autocomplete
                                              className={classes.textField}
                                              options={compoundHints.storage}
                                              textFieldProps={{
                                                name: 'storage',
                                                label: 'Storage Conditions',
                                                margin: 'none',
                                                value: this.state.storage,
                                                onChange: this.handleChange,
                                                error: Boolean(errors.storage),
                                                helperText: errors.storage
                                              }}>
                                            </Autocomplete>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                      {
                                        update ? (
                                          <Grid item xs={12} lg={6}>
                                            <Paper className={classes.paper} elevation={16}>
                                              <StructureImage className={classes.structure} molblock={this.state.molblock} />
                                            </Paper>
                                          </Grid>
                                        ) : (
                                          <Grid item xs={12} lg={6}>
                                            <StructureEditor
                                              onChange={
                                                (molblock) => this.handleChange({ target: {name: 'molblock', value: molblock }})
                                              }
                                              molblock=""
                                              smiles={this.props.structure !== undefined ? this.props.structure : ''}
                                            />
                                          </Grid>
                                        )}
                                      <Grid item xs={12}>
                                        <TextField
                                          className={classes.textField}
                                          name="description"
                                          label="Description"
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
                                    {
                                      update ? null : (
                                        <Grid
                                          container
                                          alignItems="flex-start"
                                          spacing={16}>
                                          <Grid item xs={12}>
                                            <Typography className={classes.headerSection} variant="h5" color="primary" gutterBottom>
                                              Container Information
                                            </Typography>
                                          </Grid>
                                          <Grid item xs={12} sm={3}>
                                            <TextField
                                              className={classes.textField}
                                              name="category"
                                              label="Select category"
                                              fullWidth
                                              select
                                              value={this.state.category}
                                              onChange={this.handleChange}
                                              margin="none"
                                            >
                                              {['Reagent', 'Sample'].map( category => (
                                                <MenuItem key={category} value={category}>
                                                  {category}
                                                </MenuItem>
                                              ))}
                                            </TextField>
                                          </Grid>
                                          {
                                            this.state.category == 'Sample' ? (
                                              <Grid item xs={12} sm={3}>
                                                <TextField
                                                  className={classes.textField}
                                                  name="barcode"
                                                  label="Barcode"
                                                  fullWidth
                                                  margin="none"
                                                  value={this.state.barcode}
                                                  onChange={this.handleChange}
                                                  error={Boolean(errors.barcode)}
                                                  helperText={errors.barcode}
                                                />
                                              </Grid>
                                            ) : <Grid item xs={12} sm={3}></Grid>
                                          }
                                          <Grid item xs={12} sm={6}></Grid>
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
                                              <Grid item xs={12} sm={3}>
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
                                            this.state.source == 'Institution' && this.state.category == 'Sample' ? (
                                              <Grid item xs={12} sm={3}>
                                                <TextField
                                                  className={classes.textField}
                                                  name="eln_id"
                                                  label="ELN ID"
                                                  fullWidth
                                                  margin="none"
                                                  value={this.state.eln_id}
                                                  onChange={this.handleChange}
                                                  error={Boolean(errors.eln_id)}
                                                  helperText={errors.eln_id}
                                                />
                                              </Grid>
                                            ) : <Grid item xs={12} sm={3}></Grid>
                                          }
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
                                              name="container_description"
                                              label="Container Description"
                                              fullWidth
                                              multiline
                                              margin="none"
                                              value={this.state.container_description}
                                              onChange={this.handleChange}
                                              error={Boolean(errors.container_description)}
                                              helperText={errors.container_description}
                                            />
                                          </Grid>
                                        </Grid>
                                      )
                                    }
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
                                            { update ? 'Save' : 'Register' }
                                          </Button>
                                        </label>
                                      </Grid>
                                      <Grid item md={3} xs={12}>
                                        <Button variant="contained" color="secondary" fullWidth onClick={this.handleClose(clearErrors)}>
                                          Cancel
                                        </Button>
                                      </Grid>
                                      <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle1" color="textSecondary" align="right">
                                          <i>{update ? 'Edited' : 'Registered'} by {this.props.user.name}  at  {dateTimeToString(new Date())}</i>
                                        </Typography>
                                      </Grid>
                                    </Grid>
                                  </form>
                                </Paper>
                              </Grid>
                            </Grid>
                          </div>
                        )}
                      </Action>
                    )}
                  </GetContainerHints>
                )}
              </GetCompoundHints>
            )}
          </GetLocations>
        )}
      </GetUsers>
    );
  }
}

CompoundForm.propTypes = {
  classes: PropTypes.object.isRequired,
  initialState: PropTypes.object,
  structure: PropTypes.string,
  cas: PropTypes.string,
  user: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

export default withStyles(styles)(withRouter(CompoundForm));
