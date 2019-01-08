import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import HandIcon from '@material-ui/icons/PanTool';
import ListIcon from '@material-ui/icons/ViewList';
import Tooltip from '@material-ui/core/Tooltip';

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

class Chemistry extends Component {
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
          e.key === 'Enter' && this.state.search.trim().length && this.props.history.push(`/chemistry/search?q=${this.state.search.trim()}`)}>
        <Grid
          container
          justify="center"
          alignItems="center"
        >
          <Grid item xs={12}>
            <Typography align="center" variant="display1" gutterBottom className={classes.title}>
              Reagents & Samples
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
                  placeholder="Search for chemical reagents or samples"
                  fullWidth
                  margin="normal"
                  value={this.state.search}
                  onChange={this.handleChange}
                  className={classes.searchBar}
                />
              </Grid>
              <Grid item>
                <Button
                  disabled={!this.state.search.trim().length}
                  component={Link}
                  to={`/chemistry/search?q=${this.state.search}`}
                  variant="fab"
                  color="primary"
                  aria-label="Search"
                  classes={{
                    disabled: classes.disabled,
                    contained: classes.searchButton
                  }}>
                  <SearchIcon />
                </Button>
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
                <Tooltip title="Register Reagent/Sample" classes={{ tooltip: classes.tooltip }}>
                  <Button variant="fab" color="default" aria-label="Register reagent or sample" component={Link} to="/chemistry/compounds/register" className={classes.actionButton}>
                    <AddIcon fontSize="large"/>
                  </Button>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="View All Compounds" classes={{ tooltip: classes.tooltip }}>
                  <Button variant="fab" color="default" aria-label="View all compounds" component={Link} to="/chemistry/all" className={classes.actionButton}>
                    <ListIcon fontSize="large"/>
                  </Button>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="Handle Samples" classes={{ tooltip: classes.tooltip }}>
                  <Button variant="fab" color="default" aria-label="Transfer solid" component={Link} to="/chemistry/containers/handleSamples" className={classes.actionButton}>
                    <HandIcon fontSize="large"/>
                  </Button>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

Chemistry.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

export default withStyles(styles)(withRouter(Chemistry));
