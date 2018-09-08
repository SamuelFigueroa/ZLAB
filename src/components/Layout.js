import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Header from './Header';
import Drawer from './Drawer';
import GetCurrentUser from './queries/GetCurrentUser';

export const drawerWidth = 225;

const styles = theme => ({
  root: {
    display: 'flex'

  },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  toolbar: theme.mixins.toolbar,
  content: {
    flex: '1 1 100%',
    //margin: '0 auto',
    paddingLeft: theme.spacing.unit * 5,
    paddingRight: theme.spacing.unit * 5,
    paddingTop: theme.spacing.unit * 10
    // backgroundColor: theme.palette.background.default,
    // padding: theme.spacing.unit * 3,
  },
  guestContent: {
    flex: '1 1 100%',
    paddingLeft: theme.spacing.unit * 3,
    paddingRight: theme.spacing.unit * 3,
    paddingTop: theme.spacing.unit * 10
  }
});

class Layout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mobileOpen: false
    };
  }

  handleDrawerToggle = () => {
    this.setState(state => ({ mobileOpen: !state.mobileOpen }));
  };

  render() {

    const { classes } = this.props;

    return (
      <GetCurrentUser>
        { (user, isAuthenticated) => {
          const auth = { user, isAuthenticated };
          return (
            <div className={classes.root}>
              <Header handleDrawerToggle={this.handleDrawerToggle} title='ZLAB' {...auth}/>
              { isAuthenticated ? (
                <Fragment>
                  <Drawer handleDrawerToggle={this.handleDrawerToggle} mobileOpen={this.state.mobileOpen} />
                  <main className={classes.content}>
                    {this.props.children(auth)}
                  </main>
                </Fragment>
              ) : (
                <main className={classes.guestContent}>
                  {this.props.children(auth)}
                </main>
              )
              }
            </div>
          );
        }}
      </GetCurrentUser>
    );
  }
}

Layout.propTypes = {
  children: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Layout);
