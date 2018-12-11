import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import StructureEditor from './StructureEditor';

import GetExactCompound from '../mutations/GetExactCompound';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
  },
  title: {
    paddingBottom: theme.spacing.unit
  },
  registerButton: {
    paddingTop: theme.spacing.unit * 2
  },
  input: {
    display: 'none',
  },
});

class ExactStructureSearch extends Component {
  constructor(props){
    super(props);
    this.state={
      cas: '',
      molblock: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleChange = e => this.setState({ [e.target.name]: e.target.value });

  handleClose = (clearErrors) => () => {
    clearErrors();
    return this.props.history.goBack();
  }

  handleSubmit = getExactCompound => e => {
    e.preventDefault();
    const { molblock, cas } = this.state;
    return getExactCompound(molblock, cas.trim());
  }

  render() {
    const { classes } = this.props;
    return (
      <GetExactCompound>
        { (getExactCompound, errors, clearErrors) => (
          <div className={classes.root}>
            <Grid
              container
              direction="column"
              justify="center"
              alignItems="center"
            >
              <Grid item xs={12}>
                <Typography align="center" variant="display1" gutterBottom className={classes.title}>
                  Pre-Registration Structure Check
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <form
                  onSubmit={this.handleSubmit(getExactCompound)}
                  noValidate
                  autoComplete="off">
                  <Grid
                    container
                    direction="column"
                    justify="center"
                    alignItems="center"
                    spacing={16}>
                    <Grid item xs={12}>
                      <StructureEditor
                        onChange={
                          (molblock) => this.handleChange({ target: {name: 'molblock', value: molblock }})
                        }
                        molblock=""/>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid
                        container
                        alignItems="flex-end"
                        justify="center"
                        spacing={16}>
                        <Grid item md={4} xs={12}>
                          <TextField
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
                        <Grid item md={5} xs={12} className={classes.registerButton}>
                          <input type="submit" id="register-button" className={classes.input}/>
                          <label htmlFor="register-button">
                            <Button variant="contained"  component="span" color="primary" fullWidth>
                              Proceed to Register
                            </Button>
                          </label>
                        </Grid>
                        <Grid item md={3} xs={12}>
                          <Button variant="contained" color="secondary" fullWidth onClick={this.handleClose(clearErrors)}>
                            Cancel
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </form>
              </Grid>
            </Grid>
          </div>
        )}
      </GetExactCompound>
    );
  }
}

ExactStructureSearch.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

export default withStyles(styles)(withRouter(ExactStructureSearch));
