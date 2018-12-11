import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Zoom from '@material-ui/core/Zoom';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import green from '@material-ui/core/colors/green';

import Table from '../CheckableTable';
import ContainerFormPanel from './ContainerFormPanel';
import DeleteCompoundContainers from '../mutations/DeleteCompoundContainers';
import ContainerInfoPanel from './ContainerInfoPanel';

const styles = (theme) => ({
  fab: {
    float: 'right',
    position: 'relative',
    left: theme.spacing.unit * 2,
    top: theme.spacing.unit * 1,
    zIndex: 10
  },
  fabGreen: {
    float: 'right',
    position: 'relative',
    left: theme.spacing.unit * 2,
    top: theme.spacing.unit * 1,
    zIndex: 10,
    color: theme.palette.common.white,
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
});

const containerCols = [
  { id: 'barcode', numeric: false, label: 'Barcode' },
  { id: 'source', numeric: false, label: 'Source' },
  { id: 'source_id', numeric: false, label: 'Source ID' },
  { id: 'location', numeric: false, label: 'Location' },
  { id: 'state', numeric: false, label: 'State' }
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

class Containers extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      containerExpanded: false,
      detailsExpanded: false,
      editMode: false,
      currentEntry: null,
      selectedEntry: null,
    };
    this.toggleContainerForm = this.toggleContainerForm.bind(this);
    this.toggleDetails = this.toggleDetails.bind(this);
    this.handleRowClick = this.handleRowClick.bind(this);
  }

  static contextTypes = {
    swipeableViews: PropTypes.object.isRequired,
  };

  componentDidMount() {
    setTimeout(() => this.context.swipeableViews.slideUpdateHeight(), this.props.theme.transitions.duration.standard);
  }

  componentDidUpdate() {
    setTimeout(() => this.context.swipeableViews.slideUpdateHeight(), this.props.theme.transitions.duration.standard);
  }

  toggleContainerForm = () => {
    const { containerExpanded } = this.state;
    if(this.state.editMode)
      this.setState({ containerExpanded: !containerExpanded, editMode: false, currentEntry: null });
    else {
      this.setState({ containerExpanded: !containerExpanded });
    }
  };

  toggleDetails = () => this.setState({ detailsExpanded: !this.state.detailsExpanded });

  toggleEditMode = containerID => {
    const currentEntry = this.props.containers.find(container => container.id == containerID );
    this.setState({
      containerExpanded: !this.state.editMode,
      currentEntry: !this.state.editMode ? currentEntry : null,
      editMode: !this.state.editMode });
  }

  handleRowClick = containerID => () => {
    const selectedEntry = this.props.containers.find(container => container.id == containerID );
    this.setState({ selectedEntry });
  }


  render() {
    const { classes, theme, containers, compoundID, compoundHeadline, user } = this.props;
    const { currentEntry, selectedEntry } = this.state;
    const fabs = [
      {
        color: 'primary',
        tooltip: 'Add Compound Container',
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

    const formatted_containers = containers.map(container => ({
      ...container,
      location: (container.location.area.name == 'UNASSIGNED') ?
        'UNASSIGNED' : `${container.location.area.name} / ${container.location.sub_area.name}`,
      source: container.vendor ? container.vendor : container.institution,
      source_id: container.vendor ? container.catalog_id : container.researcher,
      registration_event:
        {...container.registration_event, date: formatDate(container.registration_event.date) },
    }));

    return (
      <DeleteCompoundContainers>
        { deleteCompoundContainers => (
          <div>
            <ContainerInfoPanel
              expanded={this.state.detailsExpanded}
              container={selectedEntry}
              toggleDetails={this.toggleDetails}
              editMode={this.state.editMode}
            />
            {fabs.map((fab, index) => (
              <Zoom
                key={fab.color}
                in={Number(this.state.containerExpanded) === index}
                timeout={transitionDuration}
                mountOnEnter
                unmountOnExit
              >
                <Button variant="fab" className={fab.className} color={fab.color} onClick={this.toggleContainerForm}>
                  {fab.icon}
                </Button>
              </Zoom>
            ))}
            <Table
              cols={containerCols}
              data={formatted_containers}
              title="Containers"
              subheading={compoundHeadline}
              editMode={this.state.editMode}
              editable={true}
              actions={{
                delete: deleteCompoundContainers(compoundID),
                update: this.toggleEditMode
              }}
              onRowClick={this.handleRowClick}
            />
            <ContainerFormPanel
              initialState={currentEntry}
              expanded={this.state.containerExpanded}
              compoundID={compoundID}
              toggleForm={this.toggleContainerForm}
              editMode={this.state.editMode}
              user={user}
            />
          </div>
        )}
      </DeleteCompoundContainers>
    );
  }
}

Containers.propTypes = {
  classes: PropTypes.object.isRequired,
  containers: PropTypes.array.isRequired,
  theme: PropTypes.object.isRequired,
  compoundID: PropTypes.string.isRequired,
  compoundHeadline: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(Containers);
