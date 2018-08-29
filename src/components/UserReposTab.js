import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';

const styles = theme => ({
  label: {
    textTransform: 'capitalize'
  },
  description: {
    paddingTop: '0'
  },
  searchBar: {
    // backgroundColor: theme.palette.default,
    // paddingLeft: theme.spacing.unit,
    // paddingRight: theme.spacing.unit,
    // marginLeft: theme.spacing.unit * 3,
    flex: 1
  }
});

const UserReposTab = (props) => {
  const { classes } = props;
  return (
    <Grid
      container
      spacing={16}>
      <Grid item xs={12} className={classes.searchBar} zeroMinWidth>
        <Input type="search"
          placeholder="Search Repositories"
          disableUnderline
          fullWidth
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          }
        />
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      <Grid item xs={12}>
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
      <Grid item xs={12}>
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
    </Grid>
  );
};

export default withStyles(styles)(UserReposTab);
