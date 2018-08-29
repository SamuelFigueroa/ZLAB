import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import ListItemText from '@material-ui/core/ListItemText';

const styles = theme => ({
  label: {
    textTransform: 'capitalize'
  },
  description: {
    paddingTop: '0'
  },
  menuItem: {
    '&:focus': {
      backgroundColor: theme.palette.primary.main,
      '& $secondary': {
        color: theme.palette.common.white
      },
    },
    borderRadius: '8px',
    marginBottom: theme.spacing.unit,
    textAlign :'center',
    padding: theme.spacing.unit
  },
  secondary: {
  },
  root: {
    paddingRight: 0
  }
});

const UserOverviewTab = (props) => {
  const { classes } = props;
  return (
    <Grid
      container
      spacing={16}>
      <Grid item xs={6}>
        <Typography variant='subheading'>Pinned Repositories</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant='body2' align='right'>Customize</Typography>
      </Grid>
      <Grid item xs={6}>
        <Card>
          <CardActions>
            <Button size="small" classes={{label: classes.label}} ><Typography variant="body2" color="primary">Photochemical libraries</Typography></Button>
          </CardActions>
          <CardContent className={classes.description}>
            <Typography color="textSecondary">
              Very brief description of the project goes here
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={6}>
        <Card>
          <CardActions>
            <Button size="small" classes={{label: classes.label}} ><Typography variant="body2" color="primary">Photochemical libraries</Typography></Button>
          </CardActions>
          <CardContent className={classes.description}>
            <Typography color="textSecondary">
              Very brief description of the project goes here
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={10}>
        <Typography variant='subheading'>Contribution Activity</Typography>
        <Grid container spacing={8}>
          <Grid item xs={12}>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={2}>
        <MenuList>
          <MenuItem className={classes.menuItem}>
            <ListItemText classes={{ secondary: classes.secondary, root: classes.root }} secondary="2018" />
          </MenuItem>
          <MenuItem className={classes.menuItem}>
            <ListItemText classes={{ secondary: classes.secondary, root: classes.root }} secondary="2017" />
          </MenuItem>
        </MenuList>
      </Grid>
    </Grid>
  );
};

export default withStyles(styles)(UserOverviewTab);
