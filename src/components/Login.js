import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import HelpIcon from '@material-ui/icons/Help';

import LoginUser from './mutations/LoginUser';


const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  loginForm: {
    padding: theme.spacing.unit * 5,
  },
  loginButton: {
    paddingTop: theme.spacing.unit * 2
  },
  input: {
    display: 'none',
  },
});

class Login extends Component {
  constructor(props) {
    super(props);
    this.state={
      login: '',
      password: ''
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange = e => this.setState({ [e.target.name]: e.target.value });

  render() {
    const { classes } = this.props;
    return(
      <LoginUser>
        { (loginUser, errors) => (
          <div className={classes.root}>
            <Grid
              container
              justify="center"
              alignItems="center"
              direction="column"
              spacing={8}>
              <Grid item>
                <Typography variant="h4" gutterBottom>
                  Login to ZLAB
                </Typography>
              </Grid>
              <Grid item>
                <Paper className={classes.loginForm} elevation={12}>
                  <form className={classes.container}
                    onSubmit={
                      e => {
                        e.preventDefault();
                        return loginUser(this.state);
                      }
                    }
                    noValidate
                    autoComplete="off">
                    <Grid
                      container
                      direction="column"
                      spacing={8}>
                      <Grid item>
                        <TextField
                          name="login"
                          label="Username"
                          fullWidth
                          margin="normal"
                          value={this.state.login}
                          onChange={this.handleChange}
                          error={Boolean(errors.login)}
                          helperText={errors.login}
                        />
                      </Grid>
                      <Grid item>
                        <TextField
                          name="password"
                          label="Password"
                          type="password"
                          autoComplete="current-password"
                          margin="normal"
                          fullWidth
                          value={this.state.password}
                          onChange={this.handleChange}
                          error={Boolean(errors.password)}
                          helperText={errors.password}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Tooltip id="tooltip-icon" title="Forgot Password?" placement="top">
                                  <IconButton aria-label="Recover password">
                                    <HelpIcon />
                                  </IconButton>
                                </Tooltip>
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                      <Grid item className={classes.loginButton}>
                        <input type="submit" id="login-button" className={classes.input}/>
                        <label htmlFor="login-button">
                          <Button variant="contained"  component="span" color="primary" fullWidth>
                            Login
                          </Button>
                        </label>
                      </Grid>
                    </Grid>
                  </form>
                </Paper>
              </Grid>
            </Grid>
          </div>
        )}
      </LoginUser>
    );
  }
}

Login.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Login);
