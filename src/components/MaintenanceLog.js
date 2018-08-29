import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Zoom from '@material-ui/core/Zoom';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import green from '@material-ui/core/colors/green';


import Table from './Table';
import MaintenanceEventForm from './MaintenanceEventForm';

const styles = (theme) => ({
  fab: {
    float: 'right',
    position: 'relative',
    left: theme.spacing.unit * 2,
    bottom: theme.spacing.unit * 3,
    zIndex: 10
  },
  fabGreen: {
    float: 'right',
    position: 'relative',
    left: theme.spacing.unit * 2,
    bottom: theme.spacing.unit * 3,
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

class MaintenanceLog extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    };
    this.toggleEventForm = this.toggleEventForm.bind(this);
  }

  static contextTypes = {
    swipeableViews: PropTypes.object.isRequired,
  };

  componentDidUpdate() {
    setTimeout(() => this.context.swipeableViews.slideUpdateHeight(), this.props.theme.transitions.duration.shortest);
  }

  toggleEventForm = () => {
    const { expanded } = this.state;
    this.setState({ expanded: !expanded } );
  };

  render() {
    const { classes, theme, events, assetID, assetHeadline } = this.props;
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
      date: new Date(event.date).toLocaleDateString('en-US'),
      scheduled: event.scheduled && new Date(event.scheduled).toLocaleDateString('en-US')
    }));

    return (
      <div>
        {fabs.map((fab, index) => (
          <Zoom
            key={fab.color}
            in={Number(this.state.expanded) === index}
            timeout={transitionDuration}
            mountOnEnter
            unmountOnExit
          >
            <Button variant="fab" className={fab.className} color={fab.color} onClick={this.toggleEventForm}>
              {fab.icon}
            </Button>
          </Zoom>
        ))}
        <Table cols={maintenanceCols} data={formatted_events} title="Maintenance Log" subheading={assetHeadline} onRowClick={() => null}/>
        <MaintenanceEventForm expanded={this.state.expanded} assetID={assetID} toggleForm={this.toggleEventForm}/>
      </div>

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
