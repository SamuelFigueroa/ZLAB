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

import GetReagent from '../queries/GetReagent';
import DeleteReagent from '../mutations/DeleteReagent';
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
    maxWidth: theme.spacing.unit * 40,
    maxHeight: theme.spacing.unit * 40,
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

class ReagentInfo extends Component {
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
      <GetReagent id={id}>
        { reagent => {
          tabs[0]['component'] = (
            <div className={classes.root}>
              <Tooltip title="Edit Reagent Information">
                <Button variant="fab" className={classes.fabGreen} color="inherit" component={Link} to={`/chemistry/reagents/${reagent.id}/update`}>
                  <EditIcon />
                </Button>
              </Tooltip>
              <Grid
                container
                spacing={32}>
                <Grid item xs={12} sm={6}>
                  <Grid container spacing={32}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subheading">
                          Name: {reagent.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subheading">
                          Compound ID: {reagent.compound_id}
                      </Typography>
                    </Grid>
                    {
                      reagent.smiles ? (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subheading">
                              Smiles: {reagent.smiles}
                          </Typography>
                        </Grid>
                      ) : null
                    }
                    {
                      reagent.cas ? (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subheading">
                              CAS No.: {reagent.cas}
                          </Typography>
                        </Grid>
                      ) : null
                    }
                    {
                      reagent.attributes.length ? (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subheading">
                            Chemical Attributes:
                          </Typography>
                          {
                            reagent.attributes.map( attr =>
                              <Chip className={classes.chip} key={attr} label={attr} />)
                          }
                        </Grid>
                      ) : null
                    }
                    {
                      reagent.storage ? (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subheading">
                              Storage Conditions: {reagent.storage}
                          </Typography>
                        </Grid>
                      ) : null
                    }
                    {
                      reagent.description ? (
                        <Grid item xs={12}>
                          <Typography variant="subheading" gutterBottom>
                              Description:
                          </Typography>
                          <Typography variant="subheading">
                            {reagent.description}
                          </Typography>
                        </Grid>
                      ) : null
                    }
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper className={classes.paper} elevation={16}>
                    <StructureImage className={classes.structure} molblock={reagent.molblock} />
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={32}>
                    {
                      reagent.flags.length ? (
                        <Grid item xs={12}>
                          <Typography variant="title" color="textSecondary" className={classes.sectionTitle}>
                          Safety Information
                          </Typography>
                        </Grid>
                      ) : null
                    }
                    {
                      reagent.flags.length ? (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subheading">
                            Safety Flags:
                          </Typography>
                          {
                            reagent.flags.map( flag =>
                              <Chip className={classes.chip} key={flag} label={flag} />)
                          }
                        </Grid>
                      ) : null
                    }
                    <Grid item xs={12}>
                      <Typography variant="subheading" color="textSecondary" align="right">
                          Registered by {reagent.registration_event.user} on {dateTimeToString(reagent.registration_event.date)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </div>
          );
          tabs[1]['component'] = (
            <Containers user={user} containers={reagent.containers} reagentID={reagent.id} reagentHeadline={`${reagent.name}`}/>
          );
          if(isAuthenticated) {
            tabs[2]['component'] = (
              <DeleteReagent>
                {
                  deleteReagent => (
                    <Grid
                      container
                      alignItems="center"
                      justify="center">
                      <Grid item xs={4}>
                        <Button variant="contained" fullWidth onClick={() => deleteReagent(reagent.id)} color="secondary" className={classes.delete}>
                        Delete Reagent
                        </Button>
                      </Grid>
                    </Grid>
                  )
                }
              </DeleteReagent>
            );
          }
          return (
            <Tabs tabs={tabs} value={this.state.value} onChange={this.handleChange} onChangeIndex={this.handleChangeIndex}/>
          );
        }}
      </GetReagent>
    );
  }
}

ReagentInfo.propTypes = {
  classes: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  section: PropTypes.string.isRequired
};

export default withStyles(styles)(withRouter(ReagentInfo));
