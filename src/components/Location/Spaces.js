import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import MapIcon from '@material-ui/icons/Map';
import Tooltip from '@material-ui/core/Tooltip';
import ListIcon from '@material-ui/icons/ViewList';

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
  },
  tooltip: {
    fontSize: theme.typography.body1.fontSize
  }
});

class Facilities extends Component {
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
              Spaces
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid
              container
              alignItems="center"
              justify="center"
            >
              <Grid item>
                <Tooltip title="View All Locations" classes={{ tooltip: classes.tooltip }}>
                  <Fab color="default" aria-label="View all locations" component={Link} to="/spaces/locations" className={classes.actionButton}>
                    <ListIcon fontSize="large"/>
                  </Fab>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="View Lab Layout" classes={{ tooltip: classes.tooltip }}>
                  <Fab color="default" aria-label="View lab layout" component={Link} to="/spaces/layout" className={classes.actionButton}>
                    <MapIcon fontSize="large"/>
                  </Fab>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

Facilities.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Facilities);
