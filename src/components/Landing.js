import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  }
});

const Landing = (props) => {
  const { classes } = props;
  return(
    <div className={classes.root}>
      <Grid
        container
        justify="center"
        alignItems="center"
        direction="column"
        spacing={8}>
        <Grid item>
          <Typography variant="display1" gutterBottom>
            Welcome to ZLAB
          </Typography>
        </Grid>
      </Grid>
    </div>
  );
};

Landing.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Landing);
