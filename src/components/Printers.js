import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
// import FormHelperText from '@material-ui/core/FormHelperText';
// import MenuItem from '@material-ui/core/MenuItem';
// import ListItemText from '@material-ui/core/ListItemText';
// import InputLabel from '@material-ui/core/InputLabel';
// import FormControl from '@material-ui/core/FormControl';
// import Select from '@material-ui/core/Select';
// import Checkbox from '@material-ui/core/Checkbox';
// import InputAdornment from '@material-ui/core/InputAdornment';
// import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
// import BarcodeIcon from '@material-ui/icons/Memory';
// import ClickAwayListener from '@material-ui/core/ClickAwayListener';

import * as signalR from '@aspnet/signalr';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  printerForm: {
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

class Printers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      barcode: '',
      printerURL: '',
      connection: null,
      messages: [],
      error: ''
    };
    this.invokeMethod = this.invokeMethod.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.startConnection = this.startConnection.bind(this);
  }

  handleSubmit = e => {
    e.preventDefault();
    return this.setState({
      connection: new signalR.HubConnectionBuilder()
        .withUrl(this.state.printerURL)
        .configureLogging(signalR.LogLevel.Trace)
        .build()
    });
  }

  handleChange = e => {
    return this.setState({ [e.target.name] : e.target.value });
  }

  startConnection = async () => {
    if (this.state.connection !== null)
      try {
        await this.state.connection.start();
        await this.state.connection.on('ReceiveMessage',
          (user, message) => this.setState(
            { messages: this.state.messages.concat({
              key: this.state.messages.length,
              message: `${user} said ${message}` })
            })
        );
      } catch (err) {
        console.log(err);
        // this.setState({ error: 'The connection cannot be established'});
      }
  }

  // async componentDidMount() {
    // console.log('ComponentDidMount');
    // try {
    //   await this.state.connection.start();
    //   await this.state.connection.on('ReceiveMessage', (user, message) => console.log(`${user} said ${message}`));
    // } catch (err) {
    //   this.setState({ error: 'The connection cannot be established'});
    // }
  // }
  async componentWillUnmount() {
    if (this.state.connection)
      await this.state.connection.stop();
    // console.log('ComponentWillUnMount');

    // try {
    //   await this.state.connection.invoke('SendMessage', 'Sam', 'Bye!');
    // } catch (err) {
    //   console.log(err.toString());
    // }
  }
  invokeMethod = async () => {
    if (this.state.connection) {
      try {
        await this.state.connection.invoke('SendMessage', 'User', 'This is a test.');
      } catch(err) {
        console.log(err.toString());
      }
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <form className={classes.container}
          onSubmit={this.handleSubmit}
          noValidate
          autoComplete="off">
          <Grid
            container
            justify="center"
            alignItems="center"
            spacing={8}>
            <Grid item xs={12}>
              <Paper className={classes.printerForm} elevation={12}>
                <Grid
                  container
                  className={classes.headerSection}
                  alignItems="flex-end"
                  spacing={16}>
                  <Grid item sm={12}>
                    <Typography variant="headline" color="primary" gutterBottom>
                      Available Printers
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      name="printerURL"
                      label="Printer URL"
                      fullWidth
                      margin="normal"
                      value={this.state.printerURL}
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid item>
                    <input type="submit" id="register-button" className={classes.input}/>
                    <label htmlFor="register-button">
                      <Button variant="contained" color="primary" component="span">
                      Enter
                      </Button>
                    </label>
                  </Grid>
                  <Grid item>
                    <Button variant="contained" onClick={this.startConnection}>
                    Connect
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="contained" onClick={this.invokeMethod}>
                    Log in Console
                    </Button>
                  </Grid>
                </Grid>
                <Grid
                  container
                  alignItems="flex-end"
                  spacing={8}>
                  {
                    this.state.messages.map( message => (
                      <Grid item key={message.key} sm={12}>
                        <Typography variant="body2">
                          {message.message}
                        </Typography>
                      </Grid>
                    ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </form>
      </div>
    );
  }
}

Printers.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Printers);
