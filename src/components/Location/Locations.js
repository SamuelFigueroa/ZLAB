import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Zoom from '@material-ui/core/Zoom';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import green from '@material-ui/core/colors/green';

import Table from '../CheckableTable';
import LocationForm from './LocationForm';
import DeleteLocation from '../mutations/DeleteLocation';


const styles = (theme) => ({
  fab: {
    float: 'right',
    position: 'relative',
    left: theme.spacing.unit * 2,
    bottom: theme.spacing.unit * 2,
    zIndex: 10
  },
  fabGreen: {
    float: 'right',
    position: 'relative',
    left: theme.spacing.unit * 2,
    bottom: theme.spacing.unit * 2,
    zIndex: 10,
    color: theme.palette.common.white,
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
});

const locationCols = [
  { id: 'area', numeric: false, label: 'Area' },
  { id: 'sub_area', numeric: false, label: 'Sub Area' }
];

class Locations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      editMode: false,
      currentEntry: null
    };
    this.toggleLocationForm = this.toggleLocationForm.bind(this);
  }

  toggleLocationForm = () => {
    const { expanded } = this.state;
    if(this.state.editMode)
      this.setState({ expanded: !expanded, editMode: false, currentEntry: null });
    else {
      this.setState({ expanded: !expanded });
    }
  };

  toggleEditMode = id => {
    const ids = id.split(',');
    const location = this.props.locations.find(location => location.id == ids[0]);
    const subArea = location.area.sub_areas.find(s => s.id == ids[1]);
    const currentEntry = {
      locationID: ids[0],
      subAreaID: ids[1],
      area: location.area.name,
      sub_area: subArea.name
    };
    this.setState({
      expanded: !this.state.editMode,
      currentEntry: !this.state.editMode ? currentEntry : null,
      editMode: !this.state.editMode });
  }


  render() {
    const { classes, theme, locations } = this.props;
    const { currentEntry } = this.state;
    const fabs = [
      {
        color: 'primary',
        icon: <AddIcon />,
        className: classes.fab
      },
      {
        color: 'inherit',
        icon: <EditIcon />,
        className: classes.fabGreen
      },
    ];

    const transitionDuration = {
      enter: theme.transitions.duration.enteringScreen,
      exit: 0,
    };

    const formatted_locations = locations
      .map(location => location.area.sub_areas.map(sub_area => ({
        id: `${location.id.toString()},${sub_area.id.toString()}`,
        area: location.area.name,
        sub_area: sub_area.name
      })))
      .reduce((locs, area) => locs.concat(area));

    return (
      <DeleteLocation>
        { deleteLocation  => (
          <div>
            {fabs.map((fab, index) => (
              <Zoom
                key={fab.color}
                in={Number(this.state.expanded) === index}
                timeout={transitionDuration}
                mountOnEnter
                unmountOnExit
              >
                <Button variant="fab" className={fab.className} color={fab.color} onClick={this.toggleLocationForm}>
                  {fab.icon}
                </Button>
              </Zoom>
            ))}
            <Table
              cols={locationCols}
              data={formatted_locations}
              title="Locations"
              editMode={this.state.editMode}
              editable={true}
              actions={{
                delete: selected => {
                  const input = selected.map(id => {
                    const ids = id.split(',');
                    return { locationID: ids[0], subAreaID: ids[1] };
                  });
                  return deleteLocation(input);
                },
                update: this.toggleEditMode
              }}/>
            <LocationForm
              initialState={currentEntry}
              expanded={this.state.expanded}
              toggleForm={this.toggleLocationForm}
              editMode={this.state.editMode}/>
          </div>
        )}
      </DeleteLocation>
    );
  }
}

Locations.propTypes = {
  classes: PropTypes.object.isRequired,
  locations: PropTypes.array.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(Locations);
