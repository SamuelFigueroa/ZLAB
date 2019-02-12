import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';
import Table from '../Table';

import GetSafetyDataSheets from '../queries/GetSafetyDataSheets';
import ExportCompoundSafetyData from '../mutations/ExportCompoundSafetyData';
import SDSFilterOptions from './SDSFilterOptions';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
  },
  title: {
    paddingBottom: theme.spacing.unit * 3
  },
  tooltip: {
    fontSize: theme.typography.body1.fontSize
  },
  addButton: {
    position: 'relative',
    float: 'right',
    left: theme.spacing.unit * 2,
    top: theme.spacing.unit,
    zIndex: 1
  }
});

const sdsTable = {
  id: 'sdsBinder',
  label: 'Safety Data Sheets',
  tooltip: 'Add SDS',
  cols: [
    { id: 'molblock', numeric: false, label: 'Structure', exclude: true },
    { id: 'name', numeric: false, label: 'Name' },
    { id: 'manufacturer', numeric: false, label: 'SDS Supplier' },
    { id: 'signal_word', numeric: false, label: 'Signal Word' },
    { id: 'pictograms', numeric: false, label: 'Pictograms', exclude: true },
    { id: 'compound_id', numeric: false, label: 'Compound ID' },
  ],
  filters: [
    {
      id:'sds',
      label: 'Safety Data Sheet',
      filters: [
        { id: 'h_class', label: 'Hazard Class', type: 'multi', size: 12 },
        { id: 'manufacturer', label: 'Manufacturer', type: 'multi', size: 12 },
        { id: 'signal_word', label: 'Signal Word', type: 'multi', size: 6 },
        { id: 'pictograms', label: 'Pictograms', type: 'multi', size: 6 },
      ]
    }
  ]
};

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
            <Typography align="center" variant="display1" className={classes.title}>
              SDS Binder
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <GetSafetyDataSheets>
              { (getSafetyDataSheets, errors, clearErrors) => (
                <Fragment>
                  <Tooltip title={sdsTable.tooltip}>
                    <Button
                      className={classes.addButton}
                      variant="fab"
                      color="primary"
                      aria-label="Add"
                      component={Link}
                      to="/safety/sds/new">
                      <AddIcon />
                    </Button>
                  </Tooltip>
                  <ExportCompoundSafetyData>
                    {
                      (mutate, exportErrors, clearExportErrors) =>
                        <Table
                          cols={sdsTable.cols}
                          data={{
                            query: {
                              execute: async filter => {
                                let data = await getSafetyDataSheets(filter, null);
                                return data;
                              },
                            },
                            errors,
                            clearErrors,
                          }}
                          defaultFilter={{}}
                          filterOptions={SDSFilterOptions}
                          filters={sdsTable.filters}
                          title={sdsTable.label}
                          onRowClick={this.linkToSDSInfo}
                          exportData={{
                            mutate: async input => {
                              input.search2 = input.search;
                              input.search = null;
                              let response = await mutate(input);
                              let fileURL = response !== undefined ? response.data.exportCompoundSafetyData : null;
                              return fileURL;
                            },
                            errors:exportErrors,
                            clearErrors:clearExportErrors
                          }}
                        />
                    }
                  </ExportCompoundSafetyData>
                </Fragment>
              )}
            </GetSafetyDataSheets>
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
