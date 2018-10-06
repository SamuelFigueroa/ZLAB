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
import InputAdornment from '@material-ui/core/InputAdornment';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import BarcodeIcon from '@material-ui/icons/Memory';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Autocomplete from './Autocomplete';
import AddAsset from './mutations/AddAsset';
import UpdateAsset from './mutations/UpdateAsset';
import GetLocations from './queries/GetLocations';
import GetUsers from './queries/GetUsers';
import GetEquipmentHints from './queries/GetEquipmentHints';


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

const formatCurrency = (n) => new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD' }).format(n);

const formatDate = (d) => {
  const date = new Date(d);
  date.setHours(date.getHours() + (date.getTimezoneOffset() / 60));
  const dateArr = new Intl.DateTimeFormat('en-US',
    { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date).split('/');
  const year = dateArr.pop();
  dateArr.unshift(year);
  return dateArr.join('-');
};

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

const conditions = ['To Be Installed', 'Fully Operational', 'Maintenance Due', 'Needs Repair', 'Decommissioned'];

class EquipmentForm extends Component {
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
        serial_number: this.props.initialState.serial_number,
        model: this.props.initialState.model,
        brand: this.props.initialState.brand,
        purchasing_info: {
          date: formatDate(this.props.initialState.purchasing_info.date),
          supplier: this.props.initialState.purchasing_info.supplier,
          warranty_exp: this.props.initialState.purchasing_info.warranty_exp &&
          formatDate(this.props.initialState.purchasing_info.warranty_exp),
          price: this.props.initialState.purchasing_info.price,
          rendered_price: formatCurrency(this.props.initialState.purchasing_info.price).slice(1)
        },
        shared: this.props.initialState.shared,
        training_required: this.props.initialState.training_required,
        grant: {
          funding_agency: this.props.initialState.grant.funding_agency,
          grant_number: this.props.initialState.grant.grant_number,
          project_name: this.props.initialState.grant.project_name,
        },
        users: this.props.initialState.users,
        condition: this.props.initialState.condition
      };
    } else {
      this.state={
        name: '',
        description: '',
        category: 'Lab Equipment',
        location: {
          area: '',
          sub_area: '',
        },
        serial_number: '',
        model: '',
        brand: '',
        purchasing_info: {
          date: '',
          supplier: '',
          warranty_exp: '',
          price: 0.00,
          rendered_price: '0.00'
        },
        shared: 'Yes',
        training_required: 'Yes',
        grant: {
          funding_agency: '',
          grant_number: '',
          project_name: '',
        },
        users: [],
        condition: 'To Be Installed',
        registration_event: {
          user: this.props.user.login
        }
      };
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.syncRenderedPrice = this.syncRenderedPrice.bind(this);
    this.linkToCategory = this.linkToCategory.bind(this);
  }

  handleChange = e => {
    if (e.target.name === 'purchasing_info.rendered_price')
      return this.setState({ purchasing_info: {...this.state.purchasing_info, price: parseFloat(formatCurrency(parseFloat(e.target.value.replace(/,/g, ''))).slice(1).replace(/,/g, '')), rendered_price: e.target.value }});

    let keyArray = e.target.name.split('.').reverse();
    const changes = keyArray.slice(1).reduce((obj, key) => ({ [key]: {...this.state[key], ...obj}}), { [keyArray[0]]: e.target.value });
    return this.setState(changes);

  }

  handleSubmit = callAction => e => {
    e.preventDefault();
    const { rendered_price, ...purchasing_info } = this.state.purchasing_info;
    const asset = { ...this.state, purchasing_info };
    return callAction(asset);
  }

  handleClose = (clearErrors) => () => {
    clearErrors();
    return this.props.history.goBack();
  }

  syncRenderedPrice = () => {
    return this.setState({ purchasing_info: { ...this.state.purchasing_info, rendered_price: isNaN(this.state.purchasing_info.price) ? '' : formatCurrency(this.state.purchasing_info.price).slice(1) }});
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
              <GetEquipmentHints>
                { equipmentHints => (
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
                                  <Grid item sm={3}>
                                    <Autocomplete
                                      options={equipmentHints.brand}
                                      textFieldProps={{
                                        name: 'brand',
                                        label: 'Brand',
                                        margin: 'normal',
                                        value: this.state.brand,
                                        onChange: this.handleChange,
                                        error: Boolean(errors.brand),
                                        helperText: errors.brand
                                      }}>
                                    </Autocomplete>
                                  </Grid>
                                  <Grid item sm={3}>
                                    <TextField
                                      name="model"
                                      label="Model"
                                      fullWidth
                                      margin="normal"
                                      value={this.state.model}
                                      onChange={this.handleChange}
                                      error={Boolean(errors.model)}
                                      helperText={errors.model}
                                    />
                                  </Grid>
                                  <Grid item sm={3}>
                                    <TextField
                                      name="serial_number"
                                      label="Serial No."
                                      fullWidth
                                      margin="normal"
                                      value={this.state.serial_number}
                                      onChange={this.handleChange}
                                      error={Boolean(errors.serial_number)}
                                      helperText={errors.serial_number}
                                    />
                                  </Grid>
                                  <Grid item sm={3}>
                                    <TextField
                                      name="condition"
                                      label="Current Condition"
                                      fullWidth
                                      select
                                      value={this.state.condition}
                                      onChange={this.handleChange}
                                      margin="normal"
                                    >
                                      {conditions.map(option => (
                                        <MenuItem key={option} value={option}>
                                          {option}
                                        </MenuItem>
                                      ))}
                                    </TextField>
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
                                      Purchasing Information
                                    </Typography>
                                  </Grid>
                                  <Grid item sm={3}>
                                    <TextField
                                      name="purchasing_info.date"
                                      label="Purchase Date"
                                      type="date"
                                      fullWidth
                                      margin="normal"
                                      value={this.state.purchasing_info.date}
                                      onChange={this.handleChange}
                                      error={Boolean(errors.purchasing_info_date)}
                                      helperText={errors.purchasing_info_date}
                                      InputLabelProps={{
                                        shrink: true,
                                      }}
                                    />
                                  </Grid>
                                  <Grid item sm={3}>
                                    <ClickAwayListener onClickAway={this.syncRenderedPrice}>
                                      <TextField
                                        name="purchasing_info.rendered_price"
                                        label="Price"
                                        margin="normal"
                                        fullWidth
                                        value={this.state.purchasing_info.rendered_price}
                                        onChange={this.handleChange}
                                        error={Boolean(errors.purchasing_info_price)}
                                        helperText={errors.purchasing_info_price}
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
                                  <Grid item sm={3}>
                                    <TextField
                                      name="purchasing_info.supplier"
                                      label="Supplier"
                                      fullWidth
                                      margin="normal"
                                      value={this.state.purchasing_info.supplier}
                                      onChange={this.handleChange}
                                      error={Boolean(errors.purchasing_info_supplier)}
                                      helperText={errors.purchasing_info_supplier}
                                    />
                                  </Grid>
                                  <Grid item sm={3}>
                                    <TextField
                                      name="purchasing_info.warranty_exp"
                                      label="Warranty Expires"
                                      type="date"
                                      fullWidth
                                      margin="normal"
                                      value={this.state.purchasing_info.warranty_exp}
                                      onChange={this.handleChange}
                                      error={Boolean(errors.purchasing_info_warranty_exp)}
                                      helperText={errors.purchasing_info_warranty_exp}
                                      InputLabelProps={{
                                        shrink: true,
                                      }}
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
                                        {users.map(user => (
                                          <MenuItem key={user.id} value={user.id}>
                                            <Checkbox checked={this.state.users.indexOf(user.id) > -1} />
                                            <ListItemText primary={user.name} />
                                          </MenuItem>
                                        ))}
                                      </Select>
                                      {errors.users ? <FormHelperText error={Boolean(errors.users)}>{errors.users}</FormHelperText> : null}
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
              </GetEquipmentHints>
            )}
          </GetLocations>
        )}
      </GetUsers>
    );
  }
}

EquipmentForm.propTypes = {
  classes: PropTypes.object.isRequired,
  initialState: PropTypes.object,
  user: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

export default withStyles(styles)(withRouter(EquipmentForm));
