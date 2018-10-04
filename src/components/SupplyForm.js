import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import FormHelperText from '@material-ui/core/FormHelperText';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import AddAsset from './mutations/AddAsset';
import UpdateAsset from './mutations/UpdateAsset';
import GetLocations from './queries/GetLocations';
import GetUsers from './queries/GetUsers';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  assetForm: {
    padding: theme.spacing.unit * 5,
  },
  registerButton: {
    paddingTop: theme.spacing.unit * 2
  },
  input: {
    display: 'none',
  },
  headerSection: {
    paddingBottom: theme.spacing * 3
  },
  actions: {
    paddingTop: theme.spacing.unit * 5
  }
});

const dateTimeToString = (d) => {
  const date = new Date(d);
  date.setHours(date.getHours() - (date.getTimezoneOffset() / 60));
  return date.toLocaleDateString('en-US');
};

const categories = [
  { id: 'equipment', name: 'Lab Equipment'},
  { id: 'supplies', name: 'Lab Supplies'},
  //'Computer Hardware', 'Software'
];

class SupplyForm extends Component {
  constructor(props) {
    super(props);
    if(this.props.initialState) {
      this.state={
        id: this.props.initialState.id,
        name: this.props.initialState.name,
        description: this.props.initialState.description,
        category: this.props.initialState.category,
        location: {
          area: this.props.initialState.location.area.id,
          sub_area: this.props.initialState.location.sub_area.id,
        },
        shared: this.props.initialState.shared,
        training_required: this.props.initialState.training_required,
        grant: {
          funding_agency: this.props.initialState.grant.funding_agency,
          grant_number: this.props.initialState.grant.grant_number,
          project_name: this.props.initialState.grant.project_name,
        },
        users: this.props.initialState.users,
      };
    } else {
      this.state={
        name: '',
        description: '',
        category: 'Lab Supplies',
        location: {
          area: '',
          sub_area: '',
        },
        shared: 'Yes',
        training_required: 'Yes',
        grant: {
          funding_agency: '',
          grant_number: '',
          project_name: '',
        },
        users: [],
        registration_event: {
          user: this.props.user.login
        }
      };
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.linkToCategory = this.linkToCategory.bind(this);
  }

  handleChange = e => {
    let keyArray = e.target.name.split('.').reverse();
    const changes = keyArray.slice(1).reduce((obj, key) => ({ [key]: {...this.state[key], ...obj}}), { [keyArray[0]]: e.target.value });
    return this.setState(changes);
  }

  handleSubmit = callAction => e => {
    e.preventDefault();
    const asset = { ...this.state };
    return callAction(asset);
  }

  handleClose = (clearErrors) => () => {
    clearErrors();
    return this.props.history.goBack();
  }

  linkToCategory = e => this.props.history.push(`/assets/${e.target.value}/new`);

  render() {

    const { classes } = this.props;
    const update = this.props.initialState ? true : false;
    const Action = update ? UpdateAsset : AddAsset;
    return(
      <GetUsers>
        { users => (
          <GetLocations>
            { locations => (
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
                        <Typography variant="display1" gutterBottom>
                          { `${update ? 'Edit' : 'Register'} ${this.state.category}` }
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Paper className={classes.assetForm} elevation={12}>
                          <form className={classes.container}
                            onSubmit={this.handleSubmit(callAction)}
                            noValidate
                            autoComplete="off">
                            <Grid
                              container
                              className={classes.headerSection}
                              alignItems="flex-end"
                              spacing={16}>
                              <Grid item sm={8}>
                                <Typography variant="headline" color="primary" gutterBottom>
                                  General Information
                                </Typography>
                              </Grid>
                              { update ? null : (
                                <Grid item sm={4}>
                                  <TextField
                                    name="category"
                                    label="Select Category"
                                    fullWidth
                                    select
                                    value={this.state.category}
                                    onChange={this.linkToCategory}
                                    margin="normal"
                                    SelectProps={{
                                      renderValue: () => this.state.category
                                    }}
                                  >
                                    {categories.map( category => (
                                      <MenuItem key={category.id} value={category.id}>
                                        {category.name}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                </Grid>
                              )}
                            </Grid>
                            <Grid
                              container
                              alignItems="flex-start"
                              spacing={16}>
                              <Grid item sm={3}>
                                <TextField
                                  name="name"
                                  label="Name"
                                  fullWidth
                                  margin="normal"
                                  value={this.state.name}
                                  onChange={this.handleChange}
                                  error={Boolean(errors.name)}
                                  helperText={errors.name}
                                />
                              </Grid>
                              <Grid item md={9} xs={12}>
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
                              <Grid item xs={12}>
                                <Typography variant="headline" color="primary" className={classes.sectionTitle}>
                                  Grant Information
                                </Typography>
                              </Grid>
                              <Grid item sm={4}>
                                <TextField
                                  name="grant.grant_number"
                                  label="Grant No."
                                  fullWidth
                                  margin="normal"
                                  value={this.state.grant.grant_number}
                                  onChange={this.handleChange}
                                  error={Boolean(errors.grant_grant_number)}
                                  helperText={errors.grant_grant_number}
                                />
                              </Grid>
                              <Grid item sm={4}>
                                <TextField
                                  name="grant.funding_agency"
                                  label="Funding Agency"
                                  fullWidth
                                  margin="normal"
                                  value={this.state.grant.funding_agency}
                                  onChange={this.handleChange}
                                  error={Boolean(errors.grant_funding_agency)}
                                  helperText={errors.grant_funding_agency}
                                />
                              </Grid>
                              <Grid item sm={4}>
                                <TextField
                                  name="grant.project_name"
                                  label="Project Name"
                                  fullWidth
                                  margin="normal"
                                  value={this.state.grant.project_name}
                                  onChange={this.handleChange}
                                  error={Boolean(errors.grant_project_name)}
                                  helperText={errors.grant_project_name}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="headline" color="primary" className={classes.sectionTitle}>
                                  Usage Information
                                </Typography>
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <TextField
                                  name="location.area"
                                  label="Current Location"
                                  fullWidth
                                  select
                                  margin="normal"
                                  value={this.state.location.area}
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
                              <Grid item md={3} xs={12}>
                                <TextField
                                  name="location.sub_area"
                                  label="Area Within Location"
                                  fullWidth
                                  select
                                  margin="normal"
                                  value={this.state.location.sub_area}
                                  onChange={this.handleChange}
                                  error={Boolean(errors.location_sub_area)}
                                  helperText={errors.location_sub_area}
                                >
                                  {
                                    this.state.location.area ? (
                                      locations.find(location => location.id === this.state.location.area).area.sub_areas.map(sub_area => (
                                        <MenuItem key={sub_area.id} value={sub_area.id}>
                                          {sub_area.name}
                                        </MenuItem>
                                      ))) : (
                                      <MenuItem value=''></MenuItem>
                                    )}
                                </TextField>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <TextField
                                  name="shared"
                                  label="Shared"
                                  fullWidth
                                  select
                                  value={this.state.shared}
                                  onChange={this.handleChange}
                                  margin="normal"
                                >
                                  <MenuItem value="Yes">Yes</MenuItem>
                                  <MenuItem value="No">No</MenuItem>
                                </TextField>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <TextField
                                  name="training_required"
                                  label="Training Required"
                                  fullWidth
                                  select
                                  value={this.state.training_required}
                                  onChange={this.handleChange}
                                  margin="normal"
                                >
                                  <MenuItem value="Yes">Yes</MenuItem>
                                  <MenuItem value="No">No</MenuItem>
                                </TextField>
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <FormControl
                                  fullWidth
                                  margin="normal"
                                  error={Boolean(errors.users)}
                                >
                                  <InputLabel>Allowed Users</InputLabel>
                                  <Select
                                    multiple
                                    value={this.state.users}
                                    onChange={this.handleChange}
                                    renderValue={
                                      selected => selected.map(userID =>  users.find(user => user.id === userID ).name ).join(', ')
                                    }
                                    inputProps={{
                                      name: 'users'
                                    }}
                                  >
                                    {
                                      users.map(user => (
                                        <MenuItem key={user.id} value={user.id}>
                                          <Checkbox checked={this.state.users.indexOf(user.id) > -1} />
                                          <ListItemText primary={user.name} />
                                        </MenuItem>
                                      ))
                                    }
                                  </Select>
                                  { errors.users ? <FormHelperText error={Boolean(errors.users)}>{errors.users}</FormHelperText> : null }
                                </FormControl>
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
                                <Typography variant="subheading" color="textSecondary" align="right">
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
          </GetLocations>
        )}
      </GetUsers>
    );
  }
}

SupplyForm.propTypes = {
  classes: PropTypes.object.isRequired,
  initialState: PropTypes.object,
  user: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

export default withStyles(styles)(withRouter(SupplyForm));