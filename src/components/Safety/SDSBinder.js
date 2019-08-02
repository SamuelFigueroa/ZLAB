import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import SDSTable from './SDSTable';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
  },
  title: {
    paddingBottom: theme.spacing.unit * 3
  }
});

class SDSBinder extends Component {
  constructor(props){
    super(props);
    this.linkToSDSInfo = this.linkToSDSInfo.bind(this);
  }
  linkToSDSInfo = id => () => this.props.history.push(`/safety/sds/${id}`);

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
              SDS Binder
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <SDSTable
              cacheID="safetyDataSheets"
              onRowClick={this.linkToSDSInfo}
              search={null}
            />
          </Grid>
        </Grid>
      </div>
    );
  }
}

SDSBinder.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withStyles(styles)(withRouter(SDSBinder));
