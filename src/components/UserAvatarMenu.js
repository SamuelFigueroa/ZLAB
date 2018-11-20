import React, { Component } from 'react';
import PropTypes from 'prop-types';

import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import UserAvatar from './UserAvatar';
import LogoutUser from './mutations/LogoutUser';

class UserAvatarMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null
    };
  }

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const { anchorEl } = this.state;
    const { userName } = this.props;
    const open = Boolean(anchorEl);

    return (
      <div>
        <IconButton aria-owns={open ? 'user-avatar-menu' : null}
          aria-haspopup="true"
          onClick={this.handleClick}
          color="inherit"
        >
          <UserAvatar name={userName} />
        </IconButton>
        <Menu
          id="user-avatar-menu"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={open}
          onClose={this.handleClose}
        >
          <MenuItem onClick={this.handleClose}>Profile</MenuItem>
          <MenuItem onClick={this.handleClose}>Help</MenuItem>
          <LogoutUser>
            { logoutUser => <MenuItem onClick={logoutUser}>Logout</MenuItem>}
          </LogoutUser>
        </Menu>
      </div>
    );
  }
}

UserAvatarMenu.propTypes = {
  userName: PropTypes.string.isRequired
};

export default UserAvatarMenu;
