import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import OnContainerRegistered from '../subscriptions/OnContainerRegistered';
import OnRegistrationFinished from '../subscriptions/OnRegistrationFinished';

const styles = (theme) => ({
  root: {
    paddingTop: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 3
  },
  paper: {
    paddingTop: theme.spacing.unit * 5,
    paddingLeft: theme.spacing.unit * 5,
    paddingRight: theme.spacing.unit * 5,
    paddingBottom: theme.spacing.unit * 3
  },
  button: {
    marginTop: theme.spacing.unit * 3
  },
});

class RegistrationProgress extends Component {
  constructor(props) {
    super(props);
    this.state = {
      registered: 0,
      errored: 0,
    };
    this.handleBack = this.handleBack.bind(this);
  }

  handleBack = () => this.props.history.push('/chemistry/containers/collections');

  render() {
    const { classes, collection, handleRegistrationFinished } = this.props;
    const collectionID = collection.id;
    return (
      <OnRegistrationFinished collectionID={collectionID} onRegistrationFinished={async () => {
        await handleRegistrationFinished();
      }}>
        { () =>
          <OnContainerRegistered collectionID={collectionID} onContainerRegistered={({ registered, errored })=>this.setState({ registered, errored })}>
            { () =>
              <div className={classes.root}>
                <Grid container>
                  <Grid item xs={12}>
                    <Paper className={classes.paper}>
                      <Grid container spacing={8}>
                        <Grid item xs={12}>
                          <Typography variant="h4" color="textSecondary" gutterBottom>
                            { collection.status === 'InProgress' ? 'Registration is currently in progress...' : 'Registration has finished.' }
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle1">
                            Collection: {collection.name}
                          </Typography>
                        </Grid>
                        { this.state.registered ?
                          <Grid item xs={12}>
                            <Typography variant="subtitle1">
                              Containers registered: {this.state.registered}/{collection.size}
                            </Typography>
                          </Grid>
                          : null }
                        { this.state.errored ?
                          <Grid item xs={12}>
                            <Typography variant="subtitle1" color="error">
                              Containers with errors: {this.state.errored}
                            </Typography>
                          </Grid>
                          : null }
                        <Grid item xs={12}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={this.handleBack}
                            className={classes.button}
                          >
                            Back
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </div>
            }
          </OnContainerRegistered>
        }
      </OnRegistrationFinished>
    );
  }
}

RegistrationProgress.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  collection: PropTypes.object.isRequired,
  handleRegistrationFinished: PropTypes.func.isRequired
};

export default withStyles(styles)(withRouter(RegistrationProgress));
