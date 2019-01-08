import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import ListIcon from '@material-ui/icons/ViewList';
import Tooltip from '@material-ui/core/Tooltip';

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
    textAlign: 'center'
  },
  tooltip: {
    fontSize: theme.typography.body1.fontSize
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
            <Typography align="center" variant="display1" className={classes.title}>
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
                <Button variant="fab" color="default" aria-label="Transfer mass" component={Link} to="/chemistry/containers/transferMass" className={classes.actionButton}>
                  Transfer Mass
                </Button>
              </Grid>
              <Grid item>
                <Button variant="fab" color="default" aria-label="Transfer volume" component={Link} to="/chemistry/containers/transferVolume" className={classes.actionButton}>
                  Transfer Volume
                </Button>
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
                <Button variant="fab" color="default" aria-label="Dry container" component={Link} to="/chemistry/containers/dry" className={classes.actionButton}>
                  Dry Container
                </Button>
              </Grid>
              <Grid item>
                <Button variant="fab" color="default" aria-label="Resuspend Container" component={Link} to="/chemistry/containers/resuspend" className={classes.actionButton}>
                  Resuspend Container
                </Button>
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
