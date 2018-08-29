import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import RepositoryTabs from '../containers/RepositoryTabs';

const styles = theme => ({
  container: {
    marginTop: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit,
    paddingLeft: theme.spacing.unit,
    maxWidth: '1012px',
    marginLeft: 'auto',
    marginRight: 'auto',
    overflow: 'auto'
  },
  repoIcon: {
    fontSize: '32px',
    lineHeight: '100%'
  }
});

const Repository = (props) => {
  const { classes, user } = props;
  return (
    <Grid
      container
      className={classes.container}
      spacing={16}>
      <Grid item xs={12}>
        <Grid
          container
          alignItems='center'
        >
          <Grid item>
            <Typography variant='headline'>
              {user.username + '/Photochemical-libraries'}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <RepositoryTabs />
      </Grid>
    </Grid>
  );
};

Repository.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Repository);
