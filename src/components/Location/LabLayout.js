import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Hidden from '@material-ui/core/Hidden';
import FloorPlan from './FloorPlan';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
  },
  title: {
    paddingBottom: theme.spacing.unit * 6
  },
  toolbar: theme.mixins.toolbar,
  listHeader: {
    padding: '20px'
  },
  paper: {
    padding: theme.spacing.unit * 3,
    height: theme.spacing.unit * 100
  },
  plan: {
    height: theme.spacing.unit * 80,
    width: '100%'
  },
  icon: {
    color: theme.palette.text.secondary,
    fontSize: theme.typography.title.fontSize,
    marginRight: theme.spacing.unit * 3
  },
  label: {
    padding: theme.spacing.unit * 3
  }
});

const floorPlans = [
  {id: 'isbc2', label: 'ISB, Tower C, Level 2'},
  {id: 'open_lab', label: 'Open Lab'},
  {id: 'computational', label: 'Computational'},
  {id: 'tissue_culture', label: 'Tissue Culture'},
  {id: 'equipment', label: 'Equipment'},
  {id: 'support1', label: 'Support 1'},
  {id: 'support2', label: 'Support 2'},
  {id: 'corridor', label: 'Corridor'},
  {id: 'chemical_stockroom', label: 'Chemical Stockroom'},
];

class LabLayout extends Component {
  constructor(props){
    super(props);
    this.state = {
      floorPlan: floorPlans[0].id,
      open: false,
    };
  }

  render() {
    const { classes } = this.props;
    return (
      <div
        className={classes.root}>
        <Grid
          container
          justify="center"
          spacing={8}
        >
          <Hidden lgUp>
            <Grid item xs={12}>
              <Paper elevation={8}>
                <div className={classes.toolbar} onClick={()=>this.setState({open: !this.state.open})}>
                  <Grid
                    container
                    justify="space-between"
                    alignItems="center"
                  >
                    <Grid item>
                      <Typography variant="h6" color="textSecondary" className={classes.listHeader}>
                        Layouts
                      </Typography>
                    </Grid>
                    <Grid item>
                      {this.state.open ? <ExpandLess className={classes.icon} /> : <ExpandMore className={classes.icon}/>}
                    </Grid>
                  </Grid>
                </div>
                <Collapse in={this.state.open} timeout="auto" unmountOnExit>
                  <Divider />
                  <List component="nav">
                    {
                      floorPlans.map(plan=> (
                        <ListItem key={plan.id} button onClick={()=>this.setState({floorPlan: plan.id})}>
                          <ListItemText primary={plan.label} />
                        </ListItem>
                      ))
                    }
                  </List>
                </Collapse>
              </Paper>
            </Grid>
          </Hidden>
          <Grid item xs={12} lg={10}>
            <Paper className={classes.paper} elevation={8}>
              <Typography variant="h6" color="textSecondary" className={classes.label}>
                {floorPlans.find(p=>p.id == this.state.floorPlan).label}
              </Typography>
              <FloorPlan className={classes.plan} handleAreaClick={floorPlan => this.setState({floorPlan})} name={this.state.floorPlan}/>
            </Paper>
          </Grid>
          <Hidden mdDown>
            <Grid item xs={2}>
              <Paper elevation={8}>
                <div className={classes.toolbar}>
                  <Typography variant="h6" color="textSecondary" className={classes.listHeader}>
                    Layouts
                  </Typography>
                </div>
                <Divider />
                <List component="nav">
                  {
                    floorPlans.map(plan=> (
                      <ListItem key={plan.id} button onClick={()=>this.setState({floorPlan: plan.id})}>
                        <ListItemText primary={plan.label} />
                      </ListItem>
                    ))
                  }
                </List>
              </Paper>
            </Grid>
          </Hidden>
        </Grid>
      </div>
    );
  }
}

LabLayout.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LabLayout);
