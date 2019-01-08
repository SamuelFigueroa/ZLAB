import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import ArrowIcon from '@material-ui/icons/PlayArrow';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '../Select';
import Hidden from '@material-ui/core/Hidden';
import green from '@material-ui/core/colors/green';

import TransferVolume from '../mutations/TransferVolume';

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
  arrow_default: {
    color: theme.palette.primary.light,
    fontSize: 80,
  },
  arrow_success: {
    color: green[500],
    fontSize: 80,
  },
});

class VolumeTransferForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      source: '',
      destination: '',
      volume: '',
      vol_units: 'uL',
      success: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleChange = e => {
    return this.setState({ [e.target.name] : e.target.value });
  }

  handleSubmit = (transferVolume, clearErrors) => async e => {
    e.preventDefault();
    const { source, destination, volume, vol_units } = this.state;
    let input = {
      source,
      destination,
      volume: parseFloat(volume),
      vol_units
    };
    const result = await transferVolume(input);
    if(result !== undefined) {
      clearErrors();
      this.setState({
        source: '',
        destination: '',
        volume: '',
        vol_units: 'uL',
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
      <TransferVolume>
      { (transferVolume, errors, clearErrors) => (
        <div className={classes.root}>
          <Grid
            container
            justify="center"
            alignItems="center"
            direction="column"
            spacing={8}>
            <Grid item xs={12}>
              <Typography variant="display1" gutterBottom>
                Volume Transfer
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.form} elevation={12}>
                <form className={classes.container}
                  onSubmit={this.handleSubmit(transferVolume, clearErrors)}
                  noValidate
                  autoComplete="off">
                  <Grid
                    container
                    alignItems="flex-start"
                    spacing={16}>
                    <Grid item xs={12} sm={5}>
                      <Grid
                        container
                        spacing={16}>
                        <Grid item xs={12}>
                          <Typography variant="headline" color="primary">
                            Source Container
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            className={classes.textField}
                            name="source"
                            label="Barcode"
                            fullWidth
                            margin="none"
                            value={this.state.source}
                            onChange={this.handleChange}
                            error={Boolean(errors.source)}
                            helperText={errors.source}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            className={classes.textField}
                            name="volume"
                            label="Transfer Volume"
                            fullWidth
                            margin="none"
                            value={this.state.volume}
                            onChange={this.handleChange}
                            error={Boolean(errors.volume)}
                            helperText={errors.volume}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
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
                    <Hidden smDown>
                      <Grid item xs={1} style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                        <ArrowIcon className={this.state.success ? classes.arrow_success : classes.arrow_default}/>
                      </Grid>
                    </Hidden>
                    <Grid item xs={12} sm={5}>
                      <Grid
                        container
                        spacing={16}>
                        <Grid item xs={12}>
                          <Typography variant="headline" color="primary">
                            Destination Container
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            className={classes.textField}
                            name="destination"
                            label="Barcode"
                            fullWidth
                            margin="none"
                            value={this.state.destination}
                            onChange={this.handleChange}
                            error={Boolean(errors.destination)}
                            helperText={errors.destination}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
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
                          Transfer
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
    </TransferVolume>
    );
  }
}

VolumeTransferForm.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

export default withStyles(styles)(withRouter(VolumeTransferForm));
