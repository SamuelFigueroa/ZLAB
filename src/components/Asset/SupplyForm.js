import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import AddAsset from '../mutations/AddAsset';
import UpdateAsset from '../mutations/UpdateAsset';

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
        shared: this.props.initialState.shared,
      };
    } else {
      this.state={
        name: '',
        description: '',
        category: 'Lab Supplies',
        shared: 'Yes',
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
    return this.setState({ [e.target.name] : e.target.value });
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
                          Usage Information
                        </Typography>
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
