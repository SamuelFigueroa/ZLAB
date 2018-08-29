import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import deepOrange from '@material-ui/core/colors/deepOrange';

const styles = {
  avatar: {
    color: '#fff',
    backgroundColor: deepOrange[500]
  }
};

const UserAvatar = (props) => {
  const { classes, name } = props;
  return (
    <Avatar className={classes.avatar}>{name[0]}</Avatar>
  );
};

UserAvatar.propTypes = {
  classes: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired
};

export default withStyles(styles)(UserAvatar);
