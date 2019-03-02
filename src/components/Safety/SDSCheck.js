import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import InfoIcon from '@material-ui/icons/Info';
import Table from '../Table';

import CompoundFilterOptions from '../Chemistry/CompoundFilterOptions';
import GetCompounds from '../queries/GetCompounds';
import ExportCompoundData from '../mutations/ExportCompoundData';

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

const table = {
  id: 'compounds',
  label: 'Compounds',
  cols: [
    { id: 'molblock', numeric: false, label: 'Structure', exclude: true },
    { id: 'compound_id', numeric: false, label: 'Compound ID' },
    { id: 'name', numeric: false, label: 'Name' },
    { id: 'cas', numeric: false, label: 'CAS No.' },
    { id: 'storage', numeric: false, label: 'Storage' },
    { id: 'smiles', numeric: false, label: 'SMILES' },
  ],
  filters: [
    {
      id:'compound',
      label: 'Compound',
      filters: [
        { id: 'attributes', label: 'Attributes', type: 'multi', size: 4 },
        { id: 'flags', label: 'Flags', type: 'multi', size: 4 },
        { id: 'storage', label: 'Storage', type: 'multi', size: 4 },
        { id: 'registration_event.user', label: 'Registered By', type: 'multi', size: 4 },
        { id: 'registration_event.date', label: { min: 'Date Registered (From)', max: 'Date Registered (To)' }, type: 'range', kind: 'date', size: 3 },
      ]
    },{
      id: 'container',
      label: 'Container',
      filters: [
        { id: 'container.category', label: 'Category', type: 'single', size: 4 },
        { id: 'container.vendor', label: 'Vendor', type: 'multi', size: 4 },
        { id: 'container.institution', label: 'Institution', type: 'multi', size: 4 },
        { id: 'container.researcher', label: 'Researcher', type: 'multi', size: 4 },
        { id: 'container.location', label: 'Location', type: 'multi', size: 4 },
        { id: 'container.registration_event.user', label: 'Registered By', type: 'multi', size: 4 },
        { id: 'container.registration_event.date', label: { min: 'Date Registered (From)', max: 'Date Registered (To)' }, type: 'range', kind: 'date', size: 3 },
        { id: 'container.mass', label:{ min: 'Min. Mass', max: 'Max. Mass' }, type: 'range', kind: 'measurement', size: 3, units: { id: 'container.mass_units', default: 'mg'} },
        { id: 'container.volume', label:{ min: 'Min. Vol', max: 'Max. Vol' }, type: 'range', kind: 'measurement', size: 3, units: { id: 'container.vol_units', default: 'mL'} },
        { id: 'container.concentration', label:{ min: 'Min. Conc', max: 'Max. Conc' }, type: 'range', kind: 'measurement', size: 3, units: { id: 'container.conc_units', default: 'mM'} },
        { id: 'container.solvent', label: 'Solvent', type: 'multi', size: 4 },
        { id: 'container.state', label: 'State', type: 'multi', size: 4 },
        { id: 'container.owner', label: 'Owner', type: 'multi', size: 4 },
      ]
    }
  ]
};

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
            <Typography align="center" variant="display1" className={classes.title}>
              Compounds Without SDS
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid container alignItems="center">
              <Grid item>
                <InfoIcon className={classes.info}/>
              </Grid>
              <Grid item>
                <Typography variant="subheading">
                  Add a SDS to any of the compounds below by clicking its corresponding row.
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <GetCompounds>
              { (getCompounds, errors, clearErrors) => (
                <ExportCompoundData>
                  {
                    (mutate, exportErrors, clearExportErrors) =>
                      <Table
                        cols={table.cols}
                        data={{
                          query: {
                            execute: async filter => {
                              let data = await getCompounds(filter, null, false);
                              return data;
                            },
                          },
                          errors: errors[table.id] !== undefined ? errors[table.id] : errors,
                          clearErrors,
                        }}
                        defaultFilter={{ container: { category: 'Reagent' }}}
                        filterOptions={CompoundFilterOptions}
                        filters={table.filters}
                        title={table.label}
                        onRowClick={this.linkToAddSDS}
                        exportData={{
                          mutate: async input => {
                            input.search2 = input.search;
                            input.search = null;
                            input.withSDS = false;
                            let response = await mutate(input);
                            let fileURL = response !== undefined ? response.data.exportCompoundData : null;
                            return fileURL;
                          },
                          errors:exportErrors,
                          clearErrors:clearExportErrors
                        }}
                      />
                  }
                </ExportCompoundData>
              )}
            </GetCompounds>
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
