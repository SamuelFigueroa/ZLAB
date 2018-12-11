import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';
import Table from '../Table';
import CompoundFilterOptions from './CompoundFilterOptions';
import GetCompounds from '../queries/GetCompounds';
import GetContainers from '../queries/GetContainers';
import ExportCompoundData from '../mutations/ExportCompoundData';
import ExportContainerData from '../mutations/ExportContainerData';
import Tabs from '../Tabs';

const styles = (theme) => ({
  addButton: {
    position: 'relative',
    float: 'right',
    left: theme.spacing.unit * 2,
    top: theme.spacing.unit,
    zIndex: 1
  }
});

const tabs = [
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
  }
];
class ChemistryTabs extends Component {
  constructor(props) {
    super(props);
    const index = tabs.map(tab => tab.id).indexOf(this.props.category);
    this.state = {
      value: index == -1 ? 0 : index
    };
    this.linkToChemistryInfo = this.linkToChemistryInfo.bind(this);
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
    if(prevProps.category !== this.props.category) {
      const index = tabs.map(tab => tab.id).indexOf(this.props.category);
      if(index == -1)
      {
        let location = this.props.history.location;
        location.hash = tabs[0].id;
        this.props.history.push(location);
      }
      this.setState({ value:  index == -1 ? 0 : index });
    }
  }

  linkToChemistryInfo = (category) => (id) => () => this.props.history.push(`/chemistry/${category}/${id}`);

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
    const { classes } = this.props;
    tabs[0].component = (
      <GetContainers>
        { (getContainers, errors, clearErrors) => (
          <Fragment>
            <Tooltip title={tabs[0].tooltip}>
              <Button
                className={classes.addButton}
                variant="fab"
                color="primary"
                aria-label="Add"
                component={Link}
                to={`/chemistry/${tabs[0].id}/register`}>
                <AddIcon />
              </Button>
            </Tooltip>
            <ExportContainerData>
              {
                (mutate, exportErrors, clearExportErrors) =>
                  <Table
                    cols={tabs[0].cols}
                    data={{
                      query: {
                        execute: async filter => {
                          let data = await getContainers(filter, null);
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
                      errors: errors[tabs[0].id] !== undefined ? errors[tabs[0].id] : errors,
                      clearErrors,
                    }}
                    defaultFilter={{}}
                    filterOptions={CompoundFilterOptions}
                    filters={tabs[0].filters}
                    title={tabs[0].label}
                    onRowClick={this.linkToChemistryInfo(tabs[0].id)}
                    exportData={{
                      mutate: async input => {
                        input.search2 = input.search;
                        input.search = null;
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
    tabs[1].component = (
      <GetCompounds>
        { (getCompounds, errors, clearErrors) => (
          <Fragment>
            <Tooltip title={tabs[1].tooltip}>
              <Button
                className={classes.addButton}
                variant="fab"
                color="primary"
                aria-label="Add"
                component={Link}
                to={`/chemistry/${tabs[1].id}/register`}>
                <AddIcon />
              </Button>
            </Tooltip>
            <ExportCompoundData>
              {
                (mutate, exportErrors, clearExportErrors) =>
                  <Table
                    cols={tabs[1].cols}
                    data={{
                      query: {
                        execute: async filter => {
                          let data = await getCompounds(filter, null);
                          return data;
                        },
                      },
                      errors: errors[tabs[1].id] !== undefined ? errors[tabs[1].id] : errors,
                      clearErrors,
                    }}
                    defaultFilter={{}}
                    filterOptions={CompoundFilterOptions}
                    filters={tabs[1].filters}
                    title={tabs[1].label}
                    onRowClick={this.linkToChemistryInfo(tabs[1].id)}
                    exportData={{
                      mutate: async input => {
                        input.search2 = input.search;
                        input.search = null;
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

    return  <Tabs tabs={tabs} value={this.state.value} onChange={this.handleChange} onChangeIndex={this.handleChangeIndex}/>;

  }
}

ChemistryTabs.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  category: PropTypes.string.isRequired
};

export default withStyles(styles)(withRouter(ChemistryTabs));
