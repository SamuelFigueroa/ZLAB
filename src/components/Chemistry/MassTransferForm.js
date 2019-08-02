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
import Hidden from '@material-ui/core/Hidden';
import green from '@material-ui/core/colors/green';

import TransferMass from '../mutations/TransferMass';

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

class MassTransferForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      source: '',
      destination: '',
      src_init_mg: '',
      src_fin_mg: '',
      dst_init_mg: '',
      dst_fin_mg: '',
      success: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleChange = e => {
    return this.setState({ [e.target.name] : e.target.value });
  }

  handleSubmit = (transferMass, clearErrors) => async e => {
    e.preventDefault();
    const { source, destination, src_init_mg, src_fin_mg, dst_init_mg, dst_fin_mg } = this.state;
    let input = {
      source,
      destination,
      src_init_mg: parseFloat(src_init_mg),
      src_fin_mg: parseFloat(src_fin_mg),
      dst_init_mg: parseFloat(dst_init_mg),
      dst_fin_mg: parseFloat(dst_fin_mg)
    };
    const result = await transferMass(input);
    if(result !== undefined) {
      clearErrors();
      this.setState({
        source: '',
        destination: '',
        src_init_mg: '',
        src_fin_mg: '',
        dst_init_mg: '',
        dst_fin_mg: '',
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
      <TransferMass>
        { (transferMass, errors, clearErrors) => (
          <div className={classes.root}>
            <Grid
              container
              justify="center"
              alignItems="center"
              direction="column"
              spacing={8}>
              <Grid item xs={12}>
                <Typography variant="h4" gutterBottom>
                  Mass Transfer
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Paper className={classes.form} elevation={12}>
                  <form className={classes.container}
                    onSubmit={this.handleSubmit(transferMass, clearErrors)}
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
                            <Grid
                              container
                              alignItems="center"
                              spacing={16}>
                              <Grid item xs={8}>
                                <Typography variant="h5" color="primary">
                                  Source Container
                                </Typography>
                              </Grid>
                              <Grid item xs={4}>
                                <TextField
                                  className={classes.textField}
                                  disabled={true}
                                  label="Deduction (mg)"
                                  fullWidth
                                  margin="none"
                                  value={!isNaN(parseFloat(this.state.src_init_mg - this.state.src_fin_mg)) ? Math.round(parseFloat(this.state.src_init_mg - this.state.src_fin_mg) * 1000)/1000 : ''}
                                />
                              </Grid>
                            </Grid>
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
                              name="src_init_mg"
                              label="Initial weight (mg)"
                              fullWidth
                              margin="none"
                              value={this.state.src_init_mg}
                              onChange={this.handleChange}
                              error={Boolean(errors.src_init_mg)}
                              helperText={errors.src_init_mg}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              className={classes.textField}
                              name="src_fin_mg"
                              label="Final weight (mg)"
                              fullWidth
                              margin="none"
                              value={this.state.src_fin_mg}
                              onChange={this.handleChange}
                              error={Boolean(errors.src_fin_mg)}
                              helperText={errors.src_fin_mg}
                            />
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
                            <Grid
                              container
                              alignItems="center"
                              spacing={16}>
                              <Grid item xs={8}>
                                <Typography variant="h5" color="primary">
                                  Destination Container
                                </Typography>
                              </Grid>
                              <Grid item xs={4}>
                                <TextField
                                  className={classes.textField}
                                  disabled={true}
                                  label="Transferred (mg)"
                                  fullWidth
                                  margin="none"
                                  value={!isNaN(parseFloat(this.state.dst_fin_mg - this.state.dst_init_mg)) ? Math.round(parseFloat(this.state.dst_fin_mg - this.state.dst_init_mg) * 1000)/1000 : ''}
                                />
                              </Grid>
                            </Grid>
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
                          <Grid item xs={12} sm={4}>
                            <TextField
                              className={classes.textField}
                              name="dst_init_mg"
                              label="Initial weight (mg)"
                              fullWidth
                              margin="none"
                              value={this.state.dst_init_mg}
                              onChange={this.handleChange}
                              error={Boolean(errors.dst_init_mg)}
                              helperText={errors.dst_init_mg}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              className={classes.textField}
                              name="dst_fin_mg"
                              label="Final weight (mg)"
                              fullWidth
                              margin="none"
                              value={this.state.dst_fin_mg}
                              onChange={this.handleChange}
                              error={Boolean(errors.dst_fin_mg)}
                              helperText={errors.dst_fin_mg}
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
      </TransferMass>
    );
  }
}

MassTransferForm.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

export default withStyles(styles)(withRouter(MassTransferForm));
