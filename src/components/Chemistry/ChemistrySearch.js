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
import CompoundFilterOptions from './CompoundFilterOptions';
import GetCompounds from '../queries/GetCompounds';
import GetContainers from '../queries/GetContainers';
import ExportCompoundData from '../mutations/ExportCompoundData';
import ExportContainerData from '../mutations/ExportContainerData';

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
    id: 'containers',
    label: 'Containers',
    component: null,
    tooltip: 'Add Container',
    cols: [
      { id: 'molblock', numeric: false, label: 'Structure', exclude: true },
      { id: 'barcode', numeric: false, label: 'Barcode' },
      { id: 'batch_id', numeric: false, label: 'Batch ID' },
      { id: 'source', numeric: false, label: 'Source' },
      { id: 'source_id', numeric: false, label: 'Source ID' },
      { id: 'amount', numeric: false, label: 'Amount' },
      { id: 'location', numeric: false, label: 'Location' },
    ],
    filters: [
      {
        id:'compound',
        label: 'Compound',
        filters: [
          { id: 'attributes', label: 'Attributes', type: 'multi', size: 4 },
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
  },
  {
    id: 'compounds',
    label: 'Compounds',
    component: null,
    tooltip: 'Add Compound',
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
  }
];

class ChemistrySearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: {
        containers: null,
        compounds: null
      },
      queriesExecuted: false
    };
    this.linkToChemistryInfo = this.linkToChemistryInfo.bind(this);
  }

  async componentDidMount() {
    let containers = await this.props.data.query.containers(null, this.props.search);
    let compounds = await this.props.data.query.compounds(null, this.props.search);

    return this.setState({
      queriesExecuted: true,
      results: {
        containers: containers && containers.length ? containers : this.state.results.containers,
        compounds: compounds && compounds.length ? compounds : this.state.results.compounds,
      }
    });
  }

  linkToChemistryInfo = (category) => (id) => () => this.props.history.push(`/chemistry/${category}/${id}#profile`);

  render() {
    const { classes } = this.props;
    const { queriesExecuted } = this.state;

    if (queriesExecuted) {
      tables[0].component = (
        <GetContainers>
          { (getContainers, errors, clearErrors) => (
            <Fragment>
              <Tooltip title={tables[0].tooltip}>
                <Button
                  className={classes.addButton}
                  variant="fab"
                  color="primary"
                  aria-label="Add"
                  component={Link}
                  to={`/chemistry/${tables[0].id}/register`}>
                  <AddIcon />
                </Button>
              </Tooltip>
              <ExportContainerData>
                {
                  (mutate, exportErrors, clearExportErrors) =>
                    <Table
                      cols={tables[0].cols}
                      data={{
                        query: {
                          execute: async filter => {
                            let data;
                            if(Object.keys(filter).length == 0)
                              data = this.state.results[tables[0].id];
                            else {
                              data = await getContainers(filter, this.props.search);
                            }
                            if (data && data.length) {
                              const formatted_containers = data.map(container => ({
                                ...container,
                                location: (container.location.area.name == 'UNASSIGNED') ?
                                  'UNASSIGNED' : `${container.location.area.name} / ${container.location.sub_area.name}`,
                                source: container.vendor ? container.vendor : container.institution,
                                source_id: container.vendor ? container.catalog_id : (
                                  container.category == 'Sample' ?  `${container.researcher} / ${container.eln_id}` :
                                    container.researcher
                                ),
                                amount: container.state == 'S' ? `${container.mass} ${container.mass_units}` : (
                                  container.state == 'L' ? `${container.volume} ${container.vol_units}` :
                                    `${container.volume} ${container.vol_units} / ${container.concentration} ${container.conc_units}`
                                )
                              }));
                              return formatted_containers;
                            }
                            return data;
                          },
                        },
                        errors: errors[tables[0].id] !== undefined ? errors[tables[0].id] : errors,
                        clearErrors,
                      }}
                      defaultFilter={{}}
                      filterOptions={CompoundFilterOptions}
                      filters={tables[0].filters}
                      title={tables[0].label}
                      onRowClick={this.linkToChemistryInfo(tables[0].id)}
                      exportData={{
                        mutate: async input => {
                          input.search2 = input.search;
                          input.search = this.props.search;
                          let response = await mutate(input);
                          let fileURL = response !== undefined ? response.data.exportContainerData : null;
                          return fileURL;
                        },
                        errors:exportErrors,
                        clearErrors:clearExportErrors
                      }}
                    />
                }
              </ExportContainerData>
            </Fragment>
          )}
        </GetContainers>
      );
      tables[1].component = (
        <GetCompounds>
          { (getCompounds, errors, clearErrors) => (
            <Fragment>
              <Tooltip title={tables[1].tooltip}>
                <Button
                  className={classes.addButton}
                  variant="fab"
                  color="primary"
                  aria-label="Add"
                  component={Link}
                  to={`/chemistry/${tables[1].id}/register`}>
                  <AddIcon />
                </Button>
              </Tooltip>
              <ExportCompoundData>
                {
                  (mutate, exportErrors, clearExportErrors) =>
                    <Table
                      cols={tables[1].cols}
                      data={{
                        query: {
                          execute: async filter => {
                            if(Object.keys(filter).length == 0)
                              return this.state.results[tables[1].id];
                            let data = await getCompounds(filter, this.props.search);
                            return data;
                          },
                        },
                        errors: errors[tables[1].id] !== undefined ? errors[tables[1].id] : errors,
                        clearErrors,
                      }}
                      defaultFilter={{}}
                      filterOptions={CompoundFilterOptions}
                      filters={tables[1].filters}
                      title={tables[1].label}
                      onRowClick={this.linkToChemistryInfo(tables[1].id)}
                      exportData={{
                        mutate: async input => {
                          input.search2 = input.search;
                          input.search = this.props.search;
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
            </Fragment>
          )}
        </GetCompounds>
      );
    } else {
      tables[0].component = null;
      tables[1].component = null;
    }

    return (
      <div className={classes.root}>
        {
          queriesExecuted ? (
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
