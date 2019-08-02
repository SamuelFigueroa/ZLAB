import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import InfoIcon from '@material-ui/icons/Info';
import CompoundsTable from '../Chemistry/CompoundsTable';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
  },
  title: {
    paddingBottom: theme.spacing.unit * 6
  },
  info: {
    color: theme.palette.secondary.main,
    marginRight: '6px'
  }
});

class SDSCheck extends Component {
  constructor(props){
    super(props);
    this.linkToAddSDS = this.linkToAddSDS.bind(this);
  }

  linkToAddSDS = id => () => this.props.history.push(`/safety/sds/new?compound=${id}`);

  render() {
    const { classes } = this.props;
    return (
      <div
        className={classes.root}>
        <Grid
          container
          justify="center"
          alignItems="center"
        >
          <Grid item xs={12}>
            <Typography align="center" variant="h4" className={classes.title}>
              Compounds Without SDS
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid container alignItems="center">
              <Grid item>
                <InfoIcon className={classes.info}/>
              </Grid>
              <Grid item>
                <Typography variant="subtitle1">
                  Add a SDS to any of the compounds below by clicking its corresponding row.
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <CompoundsTable
              cacheID="sds_check"
              onRowClick={this.linkToAddSDS}
              search={null}
              withSDS={false}
            />
          </Grid>
        </Grid>
      </div>
    );
  }
}

SDSCheck.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withStyles(styles)(withRouter(SDSCheck));
