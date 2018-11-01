import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import TextIcon from '@material-ui/icons/TextFormat';
import RfidIcon from '@material-ui/icons/Nfc';
import GraphicsIcon from '@material-ui/icons/Widgets';
import BarcodeIcon from '@material-ui/icons/ViewWeek';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import DefaultsIcon from '@material-ui/icons/Settings';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';

const styles = theme => ({
  fieldList: {
    width: '100%',
    maxWidth: 360,
  },
  subheader: {
    paddingTop: theme.spacing.unit
  },
});

class FieldList extends Component {
  constructor(props){
    super(props);
  }

  render() {
    const { classes, addField, editField, deleteField, current } = this.props;
    const fieldIcons = {
      text: TextIcon,
      barcode: BarcodeIcon,
      graphic: GraphicsIcon,
      rfid: RfidIcon
    };
    return (
      <Paper className={classes.fieldList}>
        <List>
          <ListItem>
            <ListItemText
              align="center"
              primary="Format Fields"
              primaryTypographyProps={{
                color: 'primary'
              }}  />
            <Tooltip title="Add a Field" placement="top">
              <Button
                variant="fab"
                style={{ position: 'absolute', right: '-12px', bottom: '16px' }}
                color="primary"
                aria-label="Add"
                onClick={addField}>
                <AddIcon />
              </Button>
            </Tooltip>
          </ListItem>
          <Divider />
          <ListItem button onClick={editField({})}>
            <Avatar>
              <DefaultsIcon />
            </Avatar>
            <ListItemText
              primary="General"
              primaryTypographyProps={{
                color: Object.keys(current).length == 0 ? 'primary' : 'inherit'
              }}/>
          </ListItem>
          {
            this.props.fields.map(field => {
              const FieldIcon = fieldIcons[field.kind];
              return (
                <ListItem id={field.name} key={field.name} button onClick={editField(field)}>
                  <Avatar>
                    <FieldIcon />
                  </Avatar>
                  <ListItemText
                    primary={field.name}
                    secondary={field.data}
                    primaryTypographyProps={{
                      color: current.name == field.name ? 'primary' : 'inherit'
                    }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton aria-label="Delete" onClick={deleteField(field.name)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })
          }
        </List>
      </Paper>
    );
  }
}

FieldList.propTypes = {
  classes: PropTypes.object.isRequired,
  fields: PropTypes.array.isRequired,
  addField: PropTypes.func.isRequired,
  editField: PropTypes.func.isRequired,
  deleteField: PropTypes.func.isRequired,
  current: PropTypes.object.isRequired
};

export default withStyles(styles)(FieldList);
