import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import UserProfile from './UserProfile';
import UserTabs from '../containers/UserTabs';

const styles = theme => ({
  container: {
    marginTop: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit,
    paddingLeft: theme.spacing.unit,
    maxWidth: '1012px',
    marginLeft: 'auto',
    marginRight: 'auto',
    overflow: 'auto'
  }
});

const User = (props) => {
  const { classes, user } = props;
  return (
    <Grid
      container
      className={classes.container}
      spacing={16}>
      <Grid item xs={3}>
        <UserProfile user={user} />
      </Grid>
      <Grid item xs={9}>
        <UserTabs />
      </Grid>
    </Grid>
  );
};

export default withStyles(styles)(User);
