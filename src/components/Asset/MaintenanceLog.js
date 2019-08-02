import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Zoom from '@material-ui/core/Zoom';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import green from '@material-ui/core/colors/green';

import Table from '../CheckableTable';
import MaintenanceEventForm from './MaintenanceEventForm';
import DeleteMaintenanceEvent from '../mutations/DeleteMaintenanceEvent';


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

const maintenanceCols = [
  { id: 'date', numeric: false, label: 'Date' },
  { id: 'service', numeric: false, label: 'Service' },
  { id: 'agent', numeric: false, label: 'Agent' },
  { id: 'description', numeric: false, label: 'Description' },
  { id: 'scheduled', numeric: false, label: 'Scheduled' }
];

const formatDate = (d) => {
  const date = new Date(d);
  date.setHours(date.getHours() + (date.getTimezoneOffset() / 60));
  const dateArr = new Intl.DateTimeFormat('en-US',
    { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date).split('/');
  const year = dateArr.pop();
  dateArr.unshift(year);
  return dateArr.join('-');
};

class MaintenanceLog extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      editMode: false,
      currentEntry: null
    };
    this.toggleEventForm = this.toggleEventForm.bind(this);
  }

  static contextTypes = {
    swipeableViews: PropTypes.object.isRequired,
  };

  componentDidMount() {
    setTimeout(() => this.context.swipeableViews.slideUpdateHeight(), this.props.theme.transitions.duration.complex);
  }

  componentDidUpdate() {
    setTimeout(() => this.context.swipeableViews.slideUpdateHeight(), this.props.theme.transitions.duration.complex);
  }

  toggleEventForm = () => {
    const { expanded } = this.state;
    if(this.state.editMode)
      this.setState({ expanded: !expanded, editMode: false, currentEntry: null });
    else {
      this.setState({ expanded: !expanded });
    }
  };

  toggleEditMode = (eventID) => {
    const currentEntry = this.props.events.find(event => event.id == eventID );
    this.setState({
      expanded: !this.state.editMode,
      currentEntry: !this.state.editMode ? currentEntry : null,
      editMode: !this.state.editMode });
  }


  render() {
    const { classes, theme, events, assetID, assetHeadline } = this.props;
    const { currentEntry } = this.state;
    const fabs = [
      {
        color: 'primary',
        tooltip: 'Add Maintenance Event',
        icon: <AddIcon />,
        className: classes.fab
      },
      {
        color: 'inherit',
        tooltip: 'Edit Mode',
        icon: <EditIcon />,
        className: classes.fabGreen
      },
    ];

    const transitionDuration = {
      enter: theme.transitions.duration.enteringScreen,
      exit: 0,
    };

    const formatted_events = events.map(event => ({
      ...event,
      date: formatDate(event.date),
      scheduled: event.scheduled ? formatDate(event.scheduled) : ''
    }));

    return (
      <DeleteMaintenanceEvent>
        { deleteMaintenanceEvent => (
          <div>
            {fabs.map((fab, index) => (
              <Zoom
                key={fab.color}
                in={Number(this.state.expanded) === index}
                timeout={transitionDuration}
                mountOnEnter
                unmountOnExit
              >
                <Fab className={fab.className} color={fab.color} onClick={this.toggleEventForm}>
                  {fab.icon}
                </Fab>
              </Zoom>
            ))}
            <Table
              cols={maintenanceCols}
              data={formatted_events}
              title="Maintenance Log"
              subheading={assetHeadline}
              editMode={this.state.editMode}
              editable={true}
              actions={{
                delete: deleteMaintenanceEvent(assetID),
                update: this.toggleEditMode
              }}/>
            <MaintenanceEventForm
              initialState={currentEntry}
              expanded={this.state.expanded}
              assetID={assetID}
              toggleForm={this.toggleEventForm}
              editMode={this.state.editMode}/>
          </div>
        )}
      </DeleteMaintenanceEvent>
    );
  }
}

MaintenanceLog.propTypes = {
  classes: PropTypes.object.isRequired,
  events: PropTypes.array.isRequired,
  theme: PropTypes.object.isRequired,
  assetID: PropTypes.string.isRequired,
  assetHeadline: PropTypes.string.isRequired,
};

export default withStyles(styles, { withTheme: true })(MaintenanceLog);
