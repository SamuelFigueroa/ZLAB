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
import Fab from '@material-ui/core/Fab';

import GetCompound from '../queries/GetCompound';
import DeleteCompound from '../mutations/DeleteCompound';
import Tabs from '../Tabs';
import Containers from './Containers';
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
    margin:'auto'
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
  { id: 'containers', label: 'Containers', component: null },
  { id: 'actions', label: 'Actions', component: null }
];

class CompoundInfo extends Component {
  constructor(props) {
    super(props);
    const index = tabs.map(tab => tab.id).indexOf(this.props.section);
    this.state = {
      value: index == -1 ? 0 : index
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeIndex = this.handleChangeIndex.bind(this);
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

  render() {
    const { classes, id, isAuthenticated, user } = this.props;

    return (
      <GetCompound id={id}>
        { compound => {
          tabs[0]['component'] = (
            <div className={classes.root}>
              <Tooltip title="Edit Compound Information">
                <Fab className={classes.fabGreen} color="inherit" component={Link} to={`/chemistry/compounds/${compound.id}/update`}>
                  <EditIcon />
                </Fab>
              </Tooltip>
              <Grid
                container
                spacing={32}>
                <Grid item xs={12} sm={6}>
                  <Grid container spacing={32}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1" style={{ overflow: 'scroll' }}>
                          Name: {compound.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1">
                          Compound ID: {compound.compound_id}
                      </Typography>
                    </Grid>
                    {
                      compound.smiles ? (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle1" style={{ overflow: 'scroll' }}>
                              Smiles: {compound.smiles}
                          </Typography>
                        </Grid>
                      ) : null
                    }
                    {
                      compound.cas ? (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle1">
                              CAS No.: {compound.cas}
                          </Typography>
                        </Grid>
                      ) : null
                    }
                    {
                      compound.attributes.length ? (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle1">
                            Chemical Attributes:
                          </Typography>
                          {
                            compound.attributes.map( attr =>
                              <Chip className={classes.chip} key={attr} label={attr} />)
                          }
                        </Grid>
                      ) : null
                    }
                    {
                      compound.storage ? (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle1">
                              Storage Conditions:
                          </Typography>
                          <Typography variant="subtitle1" style={{ overflow: 'scroll' }}>
                            {compound.storage}
                          </Typography>
                        </Grid>
                      ) : null
                    }
                    {
                      compound.description ? (
                        <Grid item xs={12}>
                          <Typography variant="subtitle1" gutterBottom>
                              Description:
                          </Typography>
                          <Typography variant="subtitle1" style={{ overflow: 'scroll' }}>
                            {compound.description}
                          </Typography>
                        </Grid>
                      ) : null
                    }
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper className={classes.paper} elevation={16}>
                    <StructureImage className={classes.structure} molblock={compound.molblock} />
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={32}>
                    <Grid item xs={12} sm={8} md={4}>
                      <Button variant="contained" component={Link}
                        to={compound.safety ? `/safety/sds/${compound.safety}` : `/safety/sds/new?compound=${compound.id}`} color="primary" fullWidth>
                        { compound.safety ? 'Go to Safety Data Sheet' : 'Add Safety Data Sheet' }
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" color="textSecondary" align="right">
                          Registered by {compound.registration_event.user} on {dateTimeToString(compound.registration_event.date)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </div>
          );
          tabs[1]['component'] = (
            <Containers user={user} containers={compound.containers} compoundID={compound.id} compoundHeadline={`${compound.name}`}/>
          );
          if(isAuthenticated) {
            tabs[2]['component'] = (
              <DeleteCompound>
                {
                  deleteCompound => (
                    <Grid
                      container
                      alignItems="center"
                      justify="center">
                      <Grid item xs={4}>
                        <Button variant="contained" fullWidth onClick={() => deleteCompound(compound.id)} color="secondary">
                        Delete Compound
                        </Button>
                      </Grid>
                    </Grid>
                  )
                }
              </DeleteCompound>
            );
          }
          return (
            <Tabs tabs={tabs} value={this.state.value} onChange={this.handleChange} onChangeIndex={this.handleChangeIndex}/>
          );
        }}
      </GetCompound>
    );
  }
}

CompoundInfo.propTypes = {
  classes: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  section: PropTypes.string.isRequired
};

export default withStyles(styles)(withRouter(CompoundInfo));
