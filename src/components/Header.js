import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import NotifIcon from '@material-ui/icons/Notifications';
import InputAdornment from '@material-ui/core/InputAdornment';
import Hidden from '@material-ui/core/Hidden';
import MenuIcon from '@material-ui/icons/Menu';

import UserAvatarMenu from './UserAvatarMenu';
import { drawerWidth } from './Layout';

// import GetCurrentUser from './queries/GetCurrentUser';

const styles = (theme) => ({

  appBarAuth: {
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
    display: 'flex',
    flexDirection: 'column',
    top: 0,
    left: 'auto',
    right: 0,
    position: 'fixed',
    width: '100%',
    flexShrink: 0
  },
  appBar: {
    // position: 'static'
    display: 'flex',
    flexDirection: 'column',
    top: 0,
    left: 'auto',
    right: 0,
    position: 'fixed',
    width: '100%',
    flexShrink: 0
  },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  searchBar: {
    backgroundColor: theme.palette.primary.light,
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    marginLeft: theme.spacing.unit * 3,
    flex: 1
  }
});

const Header = (props) => {
  const { classes, title, user, isAuthenticated, handleDrawerToggle } = props;
  return (
    <AppBar className={ isAuthenticated ? classes.appBarAuth : classes.appBar }>
      <Toolbar>
        { isAuthenticated &&
              <IconButton
                color="inherit"
                aria-label="Open drawer"
                onClick={handleDrawerToggle}
                className={classes.navIconHide}
              >
                <MenuIcon />
              </IconButton>
        }
        <Button style={{textTransform: 'capitalize' }} color="inherit" component={Link} to="/">
          <Typography variant="title" color="inherit">
            {title}
          </Typography>
        </Button>
        { isAuthenticated ? (
          <Grid container
            alignItems="center"
            justify="flex-end"
            wrap="nowrap">
            <Hidden only="xs">
              <Grid item className={classes.searchBar} zeroMinWidth>
                <Input type="search"
                  placeholder="Search ZLAB"
                  disableUnderline
                  fullWidth
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchIcon style={{color: 'white'}}/>
                    </InputAdornment>
                  }
                />
              </Grid>
            </Hidden>
            <Grid item>
              <IconButton aria-label="Notifications"
                color="inherit"
              >
                <NotifIcon />
              </IconButton>
            </Grid>
            <Grid item>
              <UserAvatarMenu userName={user.name} />
            </Grid>
          </Grid>
        ) : (
          <Grid container
            alignItems="center"
            justify="flex-end"
          >
            <Grid item>
              <Button color="inherit" component={Link} to="/login">
                <Typography variant="title" color="inherit">
                  Login
                </Typography>
              </Button>
            </Grid>
          </Grid>
        )}
      </Toolbar>
    </AppBar>
  );
};

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  handleDrawerToggle: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  isAuthenticated: PropTypes.bool.isRequired
};

// export default Header;
export default withStyles(styles)(Header);
