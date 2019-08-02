import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';

import Zoom from '@material-ui/core/Zoom';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import green from '@material-ui/core/colors/green';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import BlockIcon from '@material-ui/icons/Block';

import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import { lighten } from '@material-ui/core/styles/colorManipulator';

import Table from '../CheckableTable';
import ContainerCollectionForm from './ContainerCollectionForm';
import ExportContainerCollection from '../mutations/ExportContainerCollection';
import DeleteContainerCollection from '../mutations/DeleteContainerCollection';
import GetContainerCollections from '../queries/GetContainerCollections';
import UnqueueContainerCollection from '../mutations/UnqueueContainerCollection';

const toolbarStyles = theme => ({
  root: {
    paddingRight: theme.spacing.unit,
    width: '80%'
  },
  highlight:
    theme.palette.type === 'light'
      ? {
        color: theme.palette.secondary.main,
        backgroundColor: lighten(theme.palette.secondary.light, 0.85),
      }
      : {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.secondary.dark,
      },
  title: {
    flex: '0 0 auto',
    zIndex: 1,
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  editMode: {
    color: green[500],
  },
});

let CollectionTableToolbar = props => {
  const { classes, title, subheading, numSelected, clearSelected, selected } = props;

  return (
    <UnqueueContainerCollection>
      { unqueueContainerCollection => (
        <DeleteContainerCollection>
          { deleteContainerCollection => (
            <div className={classNames({[classes.highlight]: numSelected > 0})}>
              <Toolbar
                className={classes.root}
              >
                { numSelected > 0 ? (
                  <Grid container
                    alignItems="center"
                    className={classes.title}
                    spacing={8}
                  >
                    <Grid item>
                      <Typography variant="h5" color="inherit">
                        {numSelected} selected
                      </Typography>
                    </Grid>
                    <Grid item>
                      <div className={classes.actions}>
                        <Tooltip title="Delete">
                          <IconButton aria-label="Delete" onClick={()=>{
                            clearSelected();
                            deleteContainerCollection(selected);
                          }}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Unqueue">
                          <IconButton aria-label="Unqueue" onClick={()=>{
                            clearSelected();
                            unqueueContainerCollection(selected);
                          }}>
                            <BlockIcon />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </Grid>
                  </Grid>
                ) : (
                  <Grid container
                    alignItems="center"
                    justify="space-between"
                    className={classes.title}
                  >
                    <Grid item>
                      <Typography variant="h5" color="primary" id="tableTitle">
                        {title}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="h5" color="textSecondary">
                        {subheading}
                      </Typography>
                    </Grid>
                  </Grid>
                )}
              </Toolbar>
            </div>
          )}
        </DeleteContainerCollection>
      )}
    </UnqueueContainerCollection>
  );
};

CollectionTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  subheading: PropTypes.string,
  numSelected: PropTypes.number.isRequired,
  selected: PropTypes.array.isRequired,
  clearSelected: PropTypes.func.isRequired,
};

const StyledCollectionTableToolbar = withStyles(toolbarStyles)(CollectionTableToolbar);

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

const collectionCols = [
  { id: 'name', numeric: false, label: 'Name' },
  { id: 'size', numeric: false, label: 'Containers'},
  { id: 'user', numeric: false, label: 'Uploaded By' },
  { id: 'status', numeric: false, label: 'Status'},
  { id: 'createdAt', numeric: false, label: 'Uploaded At' },
  { id: 'updatedAt', numeric: false, label: 'Last Modified' }
];

class ContainerCollections extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    };
    this.toggleForm = this.toggleForm.bind(this);
    this.linkToCollection = this.linkToCollection.bind(this);
  }

  toggleForm = () => {
    const { expanded } = this.state;
    this.setState({ expanded: !expanded } );
  };

  linkToCollection = (containerCollections, exportContainerCollection) => id => async () => {
    let collection = containerCollections.find(c=>c.id === id);
    if(collection.status == 'Error') {
      let docURL = await exportContainerCollection(id);
      window.open(docURL, '');
    } else if (collection.status == 'Initial' || collection.status == 'InProgress') {
      this.props.history.push(`/chemistry/containers/collections/${id}`);
    } else {
      return null;
    }
  }

  render() {
    const { classes, theme, user } = this.props;
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

    return (
      <ExportContainerCollection>
        { exportContainerCollection =>
          <GetContainerCollections>
            { containerCollections => (
              <div>
                {fabs.map((fab, index) => (
                  <Zoom
                    key={fab.color}
                    in={Number(this.state.expanded) === index}
                    timeout={transitionDuration}
                    mountOnEnter
                    unmountOnExit
                  >
                    <Fab className={fab.className} color={fab.color} onClick={this.toggleForm}>
                      {fab.icon}
                    </Fab>
                  </Zoom>
                ))}
                <Table
                  cols={collectionCols}
                  data={containerCollections}
                  title="Container Collections"
                  toolbar={StyledCollectionTableToolbar}
                  onRowClick={this.linkToCollection(containerCollections, exportContainerCollection)}
                  editMode={false}
                  editable={false}
                />
                <ContainerCollectionForm expanded={this.state.expanded} user={user} toggleForm={this.toggleForm}/>
              </div>
            )}
          </GetContainerCollections>
        }
      </ExportContainerCollection>
    );
  }
}

ContainerCollections.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(withRouter(ContainerCollections));
