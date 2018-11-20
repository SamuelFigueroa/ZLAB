import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import Table from '../Table';
import ReagentFilterOptions from './ReagentFilterOptions';
import GetReagents from '../queries/GetReagents';
import ExportReagentData from '../mutations/ExportReagentData';

const styles = (theme) => ({
  addButton: {
    position: 'relative',
    float: 'right',
    left: theme.spacing.unit * 2,
    bottom: theme.spacing.unit * 2,
    zIndex: 1
  },
  root: {
    paddingTop: theme.spacing.unit * 3,
    width: 1100,
  }
});

const tables = [
  {
    id: 'reagents',
    label: 'Reagents',
    component: null,
    tooltip: 'Add Reagent',
    cols: [
      { id: 'molblock', numeric: false, label: 'Structure', exclude: true },
      { id: 'smiles', numeric: false, label: 'SMILES' },
      { id: 'compound_id', numeric: false, label: 'Compound ID' },
      { id: 'name', numeric: false, label: 'Name' },
      { id: 'cas', numeric: false, label: 'CAS No.' },
      // { id: 'attributes', numeric: false, label: 'Attributes' },
      // { id: 'flags', numeric: false, label: 'Flags' },
      { id: 'storage', numeric: false, label: 'Storage' },
    ],
    filters: [
      {
        id:'profile',
        label: 'Profile',
        filters: [
          { id: 'attributes', label: 'Attributes', type: 'multi', size: 4 },
          { id: 'flags', label: 'Flags', type: 'multi', size: 4 },
          { id: 'storage', label: 'Storage', type: 'multi', size: 4 },
          { id: 'registration_event.user', label: 'Registered By', type: 'multi', size: 4 },
          { id: 'registration_event.date', label: { min: 'Date Registered (From)', max: 'Date Registered (To)' }, type: 'range', kind: 'date', size: 3 },
        ]
      },{
        id: 'containers',
        label: 'Containers',
        filters: [
          { id: 'containers.vendor', label: 'Vendor', type: 'multi', size: 3 },
          { id: 'containers.institution', label: 'Institution', type: 'multi', size: 3 },
          { id: 'containers.chemist', label: 'Chemist', type: 'multi', size: 3 },
          { id: 'containers.state', label: 'State', type: 'multi', size: 3 },
          { id: 'containers.mass', label:{ min: 'Min. Mass', max: 'Max. Mass' }, type: 'range', kind: 'measurement', size: 3, units: { id: 'containers.mass_units', default: 'mg'} },
          { id: 'containers.volume', label:{ min: 'Min. Vol', max: 'Max. Vol' }, type: 'range', kind: 'measurement', size: 3, units: { id: 'containers.vol_units', default: 'mL'} },
          { id: 'containers.concentration', label:{ min: 'Min. Conc', max: 'Max. Conc' }, type: 'range', kind: 'measurement', size: 3, units: { id: 'containers.conc_units', default: 'mM'} },
          { id: 'containers.solvent', label: 'Solvent', type: 'multi', size: 3 },
          { id: 'containers.location', label: 'Location', type: 'multi', size: 3 },
          { id: 'containers.owner', label: 'Owner', type: 'multi', size: 3 },
          { id: 'containers.registration_event.user', label: 'Registered By', type: 'multi', size: 3 },
          { id: 'containers.registration_event.date', label: { min: 'Date Registered (From)', max: 'Date Registered (To)' }, type: 'range', kind: 'date', size: 3 },
        ]
      }
    ]
  }
];

const filterOptions = {
  reagents: ReagentFilterOptions
};

const getItems = {
  reagents: GetReagents
};

const exportData = {
  reagents: [ExportReagentData, 'exportReagentData']
};

class ChemistrySearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: {
        reagents: null,
      },
      queryExecuted: false
    };
    this.linkToChemistryInfo = this.linkToChemistryInfo.bind(this);
  }

  async componentDidMount() {
    let reagents = await this.props.data.query(null, this.props.search);
    let state = { queryExecuted: true };
    if (reagents) {
      state.results = { ...this.state.results, reagents };
    }
    return this.setState(state);
  }

  linkToChemistryInfo = (category) => (id) => () => this.props.history.push(`/chemistry/${category}/${id}#profile`);

  render() {
    const { classes } = this.props;
    const { queryExecuted } = this.state;

    queryExecuted &&
    tables.forEach( table => {
      if (this.state.results[table.id]) {
        const GetItems = getItems[table.id];
        const FilterOptions = filterOptions[table.id];
        const ExportData = exportData[table.id][0];
        table.component = (
          <GetItems>
            { (getItems, errors, clearErrors) => (
              <Fragment>
                <Tooltip title={table.tooltip}>
                  <Button
                    className={classes.addButton}
                    variant="fab"
                    color="primary"
                    aria-label="Add"
                    component={Link}
                    to={`/chemistry/${table.id}/new`}>
                    <AddIcon />
                  </Button>
                </Tooltip>
                <ExportData>
                  {
                    (mutate, exportErrors, clearExportErrors) =>
                      <Table
                        cols={table.cols}
                        data={{
                          query: {
                            execute: async filter => {
                              if(Object.keys(filter).length == 1)
                                return this.state.results[table.id];
                              let data = await getItems(filter, this.props.search);
                              return data;
                            },
                          },
                          errors: errors[table.id] !== undefined ? errors[table.id] : errors,
                          clearErrors,
                        }}
                        defaultFilter={{}}
                        filterOptions={FilterOptions}
                        filters={table.filters}
                        title={table.label}
                        onRowClick={this.linkToChemistryInfo(table.id)}
                        exportData={{
                          mutate: async input => {
                            input.search2 = input.search;
                            input.search = this.props.search;
                            let response = await mutate(input);
                            let fileURL = response !== undefined ? response.data[exportData[table.id][1]] : null;
                            return fileURL;
                          },
                          errors:exportErrors,
                          clearErrors:clearExportErrors
                        }}
                      />
                  }
                </ExportData>
              </Fragment>
            )}
          </GetItems>
        );
      } else {
        table.component = null;
      }}
    );

    return (
      <div className={classes.root}>
        {
          queryExecuted ? (
            <Grid container spacing={8}>
              {
                Object.values(this.state.results).every(value => value === null) ? (
                  <Grid item xs={12}>
                    <Typography align="center" variant="display1" gutterBottom>
                      {`Search '${this.props.search}' did not match any documents.`}
                    </Typography>
                  </Grid>
                ) : (
                  <Grid item xs={12}>
                    <Grid container spacing={8}>
                      <Grid item xs={12}>
                        <Typography variant="headline">
                          {`Search results: '${this.props.search}'`}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        {
                          tables.map( table => (
                            <Grid key={table.id} item xs={12}>
                              {table.component}
                            </Grid>
                          ))
                        }
                      </Grid>
                    </Grid>
                  </Grid>
                )
              }
            </Grid>
          ) : null
        }
      </div>
    );
  }
}

ChemistrySearch.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  search: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired
};

export default withStyles(styles)(withRouter(ChemistrySearch));
