import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';
import Table from '../Table';
import ReagentFilterOptions from './ReagentFilterOptions';
import GetReagents from '../queries/GetReagents';
// import GetSamples from '../queries/GetSamples';
import ExportReagentData from '../mutations/ExportReagentData';
// import ExportSampleData from '../mutations/ExportSampleData';
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

  linkToChemistryInfo = (category) => (id) => () => this.props.history.push(`/chemistry/${category}/${id}#profile`);

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
    const tab = tabs[0];
    tab.component = (
      <GetReagents>
        { (getReagents, errors, clearErrors) => (
          <Fragment>
            <Tooltip title={tab.tooltip}>
              <Button
                className={classes.addButton}
                variant="fab"
                color="primary"
                aria-label="Add"
                component={Link}
                to={`/chemistry/${tab.id}/new`}>
                <AddIcon />
              </Button>
            </Tooltip>
            <ExportReagentData>
              {
                (mutate, exportErrors, clearExportErrors) =>
                  <Table
                    cols={tab.cols}
                    data={{
                      query: {
                        execute: async filter => {
                          let data = await getReagents(filter, null);
                          return data;
                        },
                      },
                      errors: errors[tab.id] !== undefined ? errors[tab.id] : errors,
                      clearErrors,
                    }}
                    defaultFilter={{}}
                    filterOptions={ReagentFilterOptions}
                    filters={tab.filters}
                    title={tab.label}
                    onRowClick={this.linkToChemistryInfo(tab.id)}
                    exportData={{
                      mutate: async input => {
                        input.search2 = input.search;
                        input.search = null;
                        let response = await mutate(input);
                        let fileURL = response !== undefined ? response.data.exportReagentData : null;
                        return fileURL;
                      },
                      errors:exportErrors,
                      clearErrors:clearExportErrors
                    }}
                  />
              }
            </ExportReagentData>
          </Fragment>
        )}
      </GetReagents>
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
