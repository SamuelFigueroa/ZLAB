import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Fab from '@material-ui/core/Fab';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import ListIcon from '@material-ui/icons/ViewList';
import Tooltip from '@material-ui/core/Tooltip';
import InventoryIcon from '@material-ui/icons/PlaylistAddCheck';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  searchButton: {
    '&$disabled' : {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.background.default,
      boxShadow: theme.shadows[2],
    }
  },
  disabled: {
    // backgroundColor: theme.palette.primary.light
  },
  title: {
    paddingBottom: theme.spacing.unit * 12
  },
  searchBar: {
    paddingBottom: theme.spacing.unit * 6
  },
  actionButton: {
    height: theme.spacing.unit * 10,
    width: theme.spacing.unit * 10,
    color: theme.palette.primary.main,
    margin: theme.spacing.unit * 2
  },
  tooltip: {
    fontSize: theme.typography.body1.fontSize
  }
});

class Assets extends Component {
  constructor(props){
    super(props);
    this.state={
      search: ''
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange = e => this.setState({ [e.target.name]: e.target.value });

  render() {
    const { classes } = this.props;
    return (
      <div
        className={classes.root}
        onKeyPress={ e =>
          e.key === 'Enter' && this.state.search.trim().length && this.props.history.push(`/assets/search?q=${this.state.search.trim()}`)}>
        <Grid
          container
          justify="center"
          alignItems="center"
        >
          <Grid item xs={12}>
            <Typography align="center" variant="h4" gutterBottom className={classes.title}>
              Equipment & Consumables
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid
              container
              justify="center"
            >
              <Grid item xs={8}>
                <TextField
                  name="search"
                  autoComplete="off"
                  placeholder="Search for lab equipment or consumables"
                  fullWidth
                  margin="normal"
                  value={this.state.search}
                  onChange={this.handleChange}
                  className={classes.searchBar}
                />
              </Grid>
              <Grid item>
                <Fab
                  disabled={!this.state.search.trim().length}
                  component={Link}
                  to={`/assets/search?q=${this.state.search}`}
                  color="primary"
                  aria-label="Search"
                  classes={{
                    root: classes.searchButton,
                    disabled: classes.disabled
                  }}>
                  <SearchIcon />
                </Fab>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid
              container
              alignItems="center"
              justify="center"
            >
              <Grid item>
                <Tooltip title="Add New Equipment/Consumables" classes={{ tooltip: classes.tooltip }}>
                  <Fab color="default" aria-label="Add asset" component={Link} to="/assets/equipment/new" className={classes.actionButton}>
                    <AddIcon fontSize="large"/>
                  </Fab>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="View All Equipment/Consumables" classes={{ tooltip: classes.tooltip }}>
                  <Fab color="default" aria-label="View all assets" component={Link} to="/assets/all" className={classes.actionButton}>
                    <ListIcon fontSize="large"/>
                  </Fab>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="Inventorize Equipment" classes={{ tooltip: classes.tooltip }}>
                  <Fab color="default" aria-label="Inventorize equipment" component={Link} to="/assets/equipment/inventory" className={classes.actionButton}>
                    <InventoryIcon fontSize="large"/>
                  </Fab>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

Assets.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

export default withStyles(styles)(withRouter(Assets));
