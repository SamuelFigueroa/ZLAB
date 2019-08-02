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
    },
  }
});

class ChemistryRegistration extends Component {
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
              Register Reagents/Samples
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid
              container
              alignItems="center"
              justify="center"
            >
              <Grid item>
                <Fab color="default" aria-label="Single compound registration" component={Link} to="/chemistry/compounds/structureCheck" className={classes.actionButton}>
                  Single Compound
                </Fab>
              </Grid>
              <Grid item>
                <Fab color="default" aria-label="Container collection registration" component={Link} to="/chemistry/containers/collections" className={classes.actionButton}>
                  Collection
                </Fab>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

ChemistryRegistration.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ChemistryRegistration);
