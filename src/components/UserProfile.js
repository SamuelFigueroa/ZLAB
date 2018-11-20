import React, {Fragment} from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import ButtonBase from '@material-ui/core/ButtonBase';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import LocationIcon from '@material-ui/icons/LocationOn';
import MailIcon from '@material-ui/icons/MailOutline';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

import UserAvatar from './UserAvatar'

const styles = theme => ({
  avatarButton: {
    position: 'relative',
    paddingTop: '100%',
    width: '100%'
  },
  imageSrc: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '8px'
  },
  fullName: {
    paddingTop: theme.spacing.unit * 2
  },
  userName: {
    paddingBottom: theme.spacing.unit
  },
  iconAvatar: {
    width: 22,
    height: 22,
  },
});

const UserProfile = (props) => {
  const { classes, user } = props;
  return (
    <div>
      <ButtonBase className={classes.avatarButton}>
        <span className={classes.imageSrc} style={{ backgroundImage: 'url()' }} />
      </ButtonBase>
      <Typography variant='title' className={classes.fullName}>
        {user.firstName + ' ' + user.lastName}
      </Typography>
      <Typography variant='subheading' className={classes.userName} color='textSecondary'>
        {user.username}
      </Typography>
      <List>
        <Divider />
        <ListItem disableGutters>
          <Avatar className={classes.iconAvatar}>
            <LocationIcon style={{ fontSize: '14px' }}/>
          </Avatar>
          <ListItemText primary={user.location} />
        </ListItem>
        <ListItem disableGutters>
          <Avatar className={classes.iconAvatar}>
            <MailIcon style={{ fontSize: '14px' }}/>
          </Avatar>
          <ListItemText primary={user.email} />
        </ListItem>
      </List>
    </div>
  );
};

export default withStyles(styles)(UserProfile);
