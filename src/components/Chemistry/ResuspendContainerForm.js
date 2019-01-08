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
import green from '@material-ui/core/colors/green';

import ResuspendContainer from '../mutations/ResuspendContainer';
import GetContainerHints from '../queries/GetContainerHints';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  form: {
    position: 'relative',
    padding: theme.spacing.unit * 5,
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
    margin: 'auto'
  },
  structure: {
    width: theme.spacing.unit * 40,
    height: theme.spacing.unit * 40,
    padding: theme.spacing.unit * 3,
    margin:'auto'
  },
  success: {
    color: green[500],
  },
});

class ResuspendContainerForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      container: '',
      concentration: '',
      conc_units: 'mM',
      solvent: '',
      success: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleChange = e => {
    return this.setState({ [e.target.name] : e.target.value });
  }

  handleSubmit = (resuspendContainer, clearErrors) => async e => {
    e.preventDefault();
    const { container, concentration, conc_units, solvent } = this.state;
    let input = {
      container,
      concentration: parseFloat(concentration),
      conc_units,
      solvent
    };
    const result = await resuspendContainer(input);
    if(result !== undefined) {
      clearErrors();
      this.setState({
        container: '',
        concentration: '',
        conc_units: 'mM',
        solvent: '',
        success: true
      });
    } else {
      this.setState({ success: false });
    }
  }

  handleClose = (clearErrors) => () => {
    clearErrors();
    return this.props.history.goBack();
  }

  render() {
    const { classes } = this.props;
    return(
      <ResuspendContainer>
      { (resuspendContainer, errors, clearErrors) => (
        <GetContainerHints>
          { containerHints => (
          <div className={classes.root}>
            <Grid
              container
              justify="center"
              alignItems="center"
              direction="column"
              spacing={8}>
              <Grid item xs={12}>
                <Typography variant="display1" gutterBottom>
                  Resuspend Container
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Paper className={classes.form} elevation={12}>
                  <form className={classes.container}
                    onSubmit={this.handleSubmit(resuspendContainer, clearErrors)}
                    noValidate
                    autoComplete="off">
                    <Grid
                      container
                      spacing={16}>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          className={classes.textField}
                          name="container"
                          label="Barcode"
                          fullWidth
                          margin="none"
                          value={this.state.container}
                          onChange={this.handleChange}
                          error={Boolean(errors.container)}
                          helperText={errors.container}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
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
                      <Grid item xs={12} sm={3}>
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
                          {['nM', 'uM', 'mM', 'M'].map(u => (
                            <MenuItem key={u} value={u}>
                              {u}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
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
                      {
                        this.state.success ? (
                          <Grid item xs={12}>
                            <Typography variant="subheading" className={classes.success}>
                              Container was successfully resuspended.
                            </Typography>
                          </Grid>
                        ) : null
                      }
                    </Grid>
                    <Grid
                      container
                      alignItems="flex-end"
                      justify="flex-start"
                      className={classes.actions}
                      spacing={32}>
                      <Grid item md={3} xs={12} className={classes.registerButton}>
                        <input type="submit" id="register-button" className={classes.input}/>
                        <label htmlFor="register-button">
                          <Button variant="contained"  component="span" color="primary" fullWidth>
                            Resuspend
                          </Button>
                        </label>
                      </Grid>
                      <Grid item md={3} xs={12}>
                        <Button variant="contained" color="secondary" fullWidth onClick={this.handleClose(clearErrors)}>
                          Cancel
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </Paper>
              </Grid>
            </Grid>
          </div>
        )}
        </GetContainerHints>
      )}
      </ResuspendContainer>
    );
  }
}

ResuspendContainerForm.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

export default withStyles(styles)(withRouter(ResuspendContainerForm));
