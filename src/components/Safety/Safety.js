import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import BookIcon from '@material-ui/icons/Book';
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
    textAlign: 'center',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark
    }
  },
  tooltip: {
    fontSize: theme.typography.body1.fontSize
  }
});

class Safety extends Component {
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
              Lab Safety
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid
              container
              alignItems="center"
              justify="center"
            >
              <Grid item>
                <Tooltip title="View All Safety Data Sheets" classes={{ tooltip: classes.tooltip }}>
                  <Fab color="default" aria-label="View all safety data sheets" component={Link} to="/safety/sds/all" className={classes.actionButton}>
                    <BookIcon fontSize="large"/>
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

Safety.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Safety);
