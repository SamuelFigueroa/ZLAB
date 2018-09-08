import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import RegisterUser from './mutations/RegisterUser';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  registerForm: {
    padding: theme.spacing.unit * 5,
    minWidth: theme.spacing.unit * 48
  },
  registerButton: {
    paddingTop: theme.spacing.unit * 2
  },
  input: {
    display: 'none',
  },
});

class Register extends Component {
  constructor(props) {
    super(props);
    this.state={
      login: '',
      name: '',
      email: '',
      password: '',
      password2: '',
      admin: false
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange = e => this.setState({ [e.target.name]: e.target.value });

  render() {
    const { classes } = this.props;
    return(
      <RegisterUser>
        { (registerUser, errors) => (
          <div className={classes.root}>
            <Grid
              container
              justify="center"
              alignItems="center"
              direction="column"
              spacing={8}>
              <Grid item>
                <Typography variant="display1" gutterBottom>
              Join ZLAB
                </Typography>
              </Grid>
              <Grid item>
                <Paper className={classes.registerForm} elevation={12}>
                  <form className={classes.container}
                    onSubmit={
                      e => {
                        e.preventDefault();
                        return registerUser(this.state);
                      }
                    }
                    noValidate
                    autoComplete="off">
                    <Grid
                      container
                      direction="column"
                      spacing={0}>
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
                          name="name"
                          label="Full name"
                          fullWidth
                          margin="normal"
                          value={this.state.name}
                          onChange={this.handleChange}
                          error={Boolean(errors.name)}
                          helperText={errors.name}
                        />
                      </Grid>
                      <Grid item>
                        <TextField
                          name="email"
                          label="Email address"
                          fullWidth
                          margin="normal"
                          value={this.state.email}
                          onChange={this.handleChange}
                          error={Boolean(errors.email)}
                          helperText={errors.email}
                        />
                      </Grid>
                      <Grid item>
                        <TextField
                          name="password"
                          label="Password"
                          type="password"
                          margin="normal"
                          value={this.state.password}
                          onChange={this.handleChange}
                          error={Boolean(errors.password)}
                          helperText={errors.password}
                          fullWidth
                        />
                      </Grid>
                      <Grid item>
                        <TextField
                          name="password2"
                          label="Confirm password"
                          type="password"
                          margin="normal"
                          value={this.state.password2}
                          onChange={this.handleChange}
                          error={Boolean(errors.password2)}
                          helperText={errors.password2}
                          fullWidth
                        />
                      </Grid>
                      <Grid item className={classes.registerButton}>
                        <input type="submit" id="register-button" className={classes.input}/>
                        <label htmlFor="register-button">
                          <Button variant="contained"  component="span" color="primary" fullWidth>
                            Register
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
      </RegisterUser>
    );
  }
}

Register.propTypes = {
  classes: PropTypes.object.isRequired
};


export default withStyles(styles)(Register);
