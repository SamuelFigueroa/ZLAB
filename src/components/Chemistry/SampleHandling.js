import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
  },
  title: {
    paddingBottom: theme.spacing.unit * 6
  },
  actionButton: {
    height: theme.spacing.unit * 12,
    width: theme.spacing.unit * 12,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.background.paper,
    margin: theme.spacing.unit * 2,
    textAlign: 'center',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark
    }
  }
});

class SampleHandling extends Component {
  constructor(props){
    super(props);
  }

  render() {
    const { classes } = this.props;
    return (
      <div
        className={classes.root}>
        <Grid
          container
          justify="center"
          alignItems="center"
        >
          <Grid item xs={12}>
            <Typography align="center" variant="h4" className={classes.title}>
              Sample Handling
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid
              container
              alignItems="center"
              justify="center"
            >
              <Grid item>
                <Fab color="default" aria-label="Transfer mass" component={Link} to="/chemistry/containers/transferMass" className={classes.actionButton}>
                  Transfer Mass
                </Fab>
              </Grid>
              <Grid item>
                <Fab color="default" aria-label="Transfer volume" component={Link} to="/chemistry/containers/transferVolume" className={classes.actionButton}>
                  Transfer Volume
                </Fab>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid
              container
              alignItems="center"
              justify="center"
            >
              <Grid item>
                <Fab color="default" aria-label="Dry container" component={Link} to="/chemistry/containers/dry" className={classes.actionButton}>
                  Dry Container
                </Fab>
              </Grid>
              <Grid item>
                <Fab color="default" aria-label="Resuspend Container" component={Link} to="/chemistry/containers/resuspend" className={classes.actionButton}>
                  Resuspend Container
                </Fab>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

SampleHandling.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SampleHandling);
