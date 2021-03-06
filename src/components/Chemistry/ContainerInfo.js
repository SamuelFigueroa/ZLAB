import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import green from '@material-ui/core/colors/green';
import EditIcon from '@material-ui/icons/Edit';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import PrintIcon from '@material-ui/icons/Print';
import Fab from '@material-ui/core/Fab';

import GetContainer from '../queries/GetContainer';
import DeleteContainer from '../mutations/DeleteContainer';
import GetUsers from '../queries/GetUsers';
import QuickPrintModal from '../Printer/QuickPrintModal';

import Tabs from '../Tabs';
import StructureImage from './StructureImage';

const dateTimeToString = (d) => {
  const date = new Date(d);
  date.setHours(date.getHours() - (date.getTimezoneOffset() / 60));
  return date.toLocaleDateString('en-US');
};

const styles = (theme) => ({
  addButton: {
    float: 'right',
    position: 'relative',
    left: theme.spacing.unit * 2,
    zIndex: 10
  },
  root: {
    paddingTop: theme.spacing.unit * 2,
  },
  registerButton: {
    paddingTop: theme.spacing.unit * 2
  },
  input: {
    display: 'none',
  },
  headerSection: {
    paddingBottom: theme.spacing * 5
  },
  fabGreen: {
    position: 'absolute',
    right: theme.spacing.unit * 4,
    top: theme.spacing.unit * 2,
    zIndex: 10,
    color: theme.palette.common.white,
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    }
  },
  sectionTitle: {
    paddingTop: theme.spacing.unit * 3
  },
  paper: {
    maxWidth: theme.spacing.unit * 50,
    maxHeight: theme.spacing.unit * 50,
    margin:'auto',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    }
  },
  structure: {
    width: theme.spacing.unit * 40,
    height: theme.spacing.unit * 40,
    padding: theme.spacing.unit * 3,
    margin:'auto'
  },
  chip: {
    margin: theme.spacing.unit
  }
});

const tabs = [
  { id: 'profile', label: 'Profile', component: null },
  { id: 'actions', label: 'Actions', component: null }
];

class ContainerInfo extends Component {
  constructor(props) {
    super(props);
    const index = tabs.map(tab => tab.id).indexOf(this.props.section);
    this.state = {
      value: index == -1 ? 0 : index,
      printModalOpen: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeIndex = this.handleChangeIndex.bind(this);
    this.openPrintModal = this.openPrintModal.bind(this);
    this.handlePrintModalClose = this.handlePrintModalClose.bind(this);
  }

  componentDidMount() {
    let location = this.props.history.location;
    if(!location.hash) {
      location.hash = tabs[this.state.value].id;
      return this.props.history.push(location);
    }
  }

  componentDidUpdate(prevProps) {
    if(prevProps.section !== this.props.section) {
      const index = tabs.map(tab => tab.id).indexOf(this.props.section);
      if(index == -1)
      {
        let location = this.props.history.location;
        location.hash = tabs[0].id;
        this.props.history.push(location);
      }
      this.setState({ value:  index == -1 ? 0 : index });
    }
  }

  handleChange = (event, value) => {
    this.setState({ value });
    let location = this.props.history.location;
    location.hash = tabs[value].id;
    return this.props.history.push(location);
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
    let location = this.props.history.location;
    location.hash = tabs[index].id;
    return this.props.history.push(location);
  };

  openPrintModal = () => this.setState({ printModalOpen: true });
  handlePrintModalClose = () => this.setState({ printModalOpen: false });

  render() {
    const { classes, id, isAuthenticated } = this.props;

    return (
      <GetUsers>
        { users => (
          <GetContainer id={id}>
            { container => {
              tabs[0]['component'] = (
                <div className={classes.root}>
                  <QuickPrintModal
                    open={this.state.printModalOpen}
                    onClose={this.handlePrintModalClose}
                    data={container.barcode}
                  />
                  <Tooltip title="Edit Container Information">
                    <Fab className={classes.fabGreen} color="inherit" component={Link} to={`/chemistry/containers/${container.id}/update`}>
                      <EditIcon />
                    </Fab>
                  </Tooltip>
                  <Grid
                    container
                    spacing={32}>
                    <Grid item xs={12}>
                      <Typography variant="h6" color="textSecondary">
                        {container.category} Container Information
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Grid container spacing={32} alignItems="center">
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle1">
                              Barcode: {container.barcode}
                            <Tooltip title="Print barcode" placement="right">
                              <IconButton aria-label="Print" onClick={this.openPrintModal}>
                                <PrintIcon />
                              </IconButton>
                            </Tooltip>
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle1">
                              Location: {(container.location.area.name == 'UNASSIGNED') ?
                              'UNASSIGNED' : `${container.location.area.name} / ${container.location.sub_area.name}`}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle1">
                              Batch ID: {container.batch_id}
                          </Typography>
                        </Grid>
                        {
                          container.vendor ? (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle1">
                                  Vendor: {container.vendor}
                              </Typography>
                            </Grid>
                          ) : (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle1">
                                  Institution: {container.institution}
                              </Typography>
                            </Grid>
                          )
                        }
                        {
                          container.catalog_id ? (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle1">
                                  Catalog No.: {container.catalog_id}
                              </Typography>
                            </Grid>
                          ) : (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle1">
                                  Researcher: {container.researcher}
                              </Typography>
                            </Grid>
                          )
                        }
                        {
                          container.eln_id  ? (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle1">
                                  ELN ID: {container.eln_id}
                              </Typography>
                            </Grid>
                          ) : null
                        }
                        {
                          (container.state == 'S') ? (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle1">
                                {`Mass: ${Math.round(container.mass*1000)/1000} ${container.mass_units}`}
                              </Typography>
                            </Grid>
                          ) : (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle1">
                                {`Volume: ${Math.round(container.volume*1000)/1000} ${container.vol_units}`}
                              </Typography>
                            </Grid>
                          )
                        }
                        {
                          (container.state == 'Soln' || container.state == 'Susp') ? (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle1">
                                {`Concentration: ${Math.round(container.concentration*1000)/1000} ${container.conc_units}`}
                              </Typography>
                            </Grid>
                          ) : null
                        }
                        {
                          (container.state == 'Soln' || container.state == 'Susp') ? (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle1">
                                  Solvent: {container.solvent}
                              </Typography>
                            </Grid>
                          ) : null
                        }
                        {
                          container.description ? (
                            <Grid item xs={12}>
                              <Typography variant="subtitle1" gutterBottom>
                                  Description:
                              </Typography>
                              <Typography variant="subtitle1">
                                {container.description}
                              </Typography>
                            </Grid>
                          ) : null
                        }
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle1">
                              Owner: {users.find(user => user.id == container.owner).name}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="h6" color="textSecondary" className={classes.sectionTitle}>
                            Content Information
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle1" style={{ overflow: 'scroll' }}>
                              Name: {container.content.name}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle1">
                              Compound ID:
                          </Typography>
                          <Link to={`/chemistry/compounds/${container.content.id}#profile`}>
                            <Typography variant="subtitle1">
                              {container.content.compound_id}
                            </Typography>
                          </Link>
                        </Grid>
                        {
                          container.content.smiles ? (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle1" style={{ overflow: 'scroll' }}>
                                  Smiles: {container.content.smiles}
                              </Typography>
                            </Grid>
                          ) : null
                        }
                        {
                          container.content.cas ? (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle1">
                                  CAS No.: {container.content.cas}
                              </Typography>
                            </Grid>
                          ) : null
                        }
                        {
                          container.content.attributes.length ? (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle1">
                                Chemical Attributes:
                              </Typography>
                              {
                                container.content.attributes.map( attr =>
                                  <Chip className={classes.chip} key={attr} label={attr} />)
                              }
                            </Grid>
                          ) : null
                        }
                        {
                          container.content.storage ? (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle1">
                                  Storage Conditions:
                              </Typography>
                              <Typography variant="subtitle1" style={{ overflow: 'scroll' }}>
                                {container.content.storage}
                              </Typography>
                            </Grid>
                          ) : null
                        }
                        {
                          container.content.description ? (
                            <Grid item xs={12}>
                              <Typography variant="subtitle1" gutterBottom>
                                  Description:
                              </Typography>
                              <Typography variant="subtitle1" style={{ overflow: 'scroll' }}>
                                {container.content.description}
                              </Typography>
                            </Grid>
                          ) : null
                        }
                      </Grid>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Link to={`/chemistry/containers/${id}/curateStructure`}>
                        <Tooltip title="Curate structure" placement="top">
                          <Paper className={classes.paper} elevation={16}>
                            <StructureImage className={classes.structure} molblock={container.content.molblock} />
                          </Paper>
                        </Tooltip>
                      </Link>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container spacing={32}>
                        <Grid item xs={12} sm={8} md={4}>
                          <Button variant="contained" component={Link}
                            to={container.content.safety ? `/safety/sds/${container.content.safety}` : `/safety/sds/new?compound=${container.content.id}`} color="primary" fullWidth>
                            { container.content.safety ? 'Go to Safety Data Sheet' : 'Add Safety Data Sheet' }
                          </Button>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle1" color="textSecondary" align="right">
                              Registered by {container.registration_event.user} on {dateTimeToString(container.registration_event.date)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </div>
              );
              if(isAuthenticated) {
                tabs[1]['component'] = (
                  <DeleteContainer>
                    {
                      deleteContainer => (
                        <Grid
                          container
                          alignItems="center"
                          justify="center">
                          <Grid item xs={4}>
                            <Button variant="contained" fullWidth onClick={() => deleteContainer(container.id)} color="secondary">
                            Delete Container
                            </Button>
                          </Grid>
                        </Grid>
                      )
                    }
                  </DeleteContainer>
                );
              }
              return (
                <Tabs tabs={tabs} value={this.state.value} onChange={this.handleChange} onChangeIndex={this.handleChangeIndex}/>
              );
            }}
          </GetContainer>
        )}
      </GetUsers>
    );
  }
}

ContainerInfo.propTypes = {
  classes: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  section: PropTypes.string.isRequired
};

export default withStyles(styles)(withRouter(ContainerInfo));
