import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Hidden from '@material-ui/core/Hidden';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';


import { drawerWidth } from './Layout';

const styles = theme => ({
  root: {
    width: drawerWidth,

  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
  appTitle: {
    padding: '20px'
  }
});

const MainDrawer = (props) => {
  const { classes, theme, mobileOpen, handleDrawerToggle } = props;

  const drawer = (
    <div>
      <div className={classes.toolbar}>
        <Typography variant="title" color="textSecondary" className={classes.appTitle}>
        ZLAB
        </Typography>
      </div>
      <Divider />
      <List component="nav">
        <ListItem button component={Link} to="/chemistry">
          <ListItemText primary="Reagents & Samples" />
        </ListItem>
        <ListItem button component={Link} to="/assets">
          <ListItemText primary="Assets" />
        </ListItem>
        <ListItem button component={Link} to="/safety">
          <ListItemText primary="Safety" />
        </ListItem>
        <ListItem button>
          <ListItemText primary="People" />
        </ListItem>
        <ListItem button component={Link} to="/spaces">
          <ListItemText primary="Spaces" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Fragment>
      <Hidden mdUp>
        <nav>
          <Drawer
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </nav>
      </Hidden>
      <Hidden smDown implementation="css">
        <nav className={classes.root}>
          <Drawer
            variant="permanent"
            open
            classes={{
              paper: classes.drawerPaper,
            }}
          >
            {drawer}
          </Drawer>
        </nav>
      </Hidden>
    </Fragment>
  );
};

MainDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  handleDrawerToggle: PropTypes.func.isRequired,
  mobileOpen: PropTypes.bool.isRequired,
  children: PropTypes.node
};

export default withStyles(styles, { withTheme: true })(MainDrawer);
