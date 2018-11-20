import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';
import Table from '../Table';
import AssetFilterOptions from './AssetFilterOptions';
import GetAssets from '../queries/GetAssets';
import ExportAssetData from '../mutations/ExportAssetData';
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
    id: 'equipment',
    label: 'Equipment',
    component: null,
    category: 'Lab Equipment',
    tooltip: 'Add Equipment',
    cols: [
      { id: 'name', numeric: false, label: 'Name' },
      { id: 'barcode', numeric: false, label: 'Barcode' },
      { id: 'model', numeric: false, label: 'Model' },
      { id: 'brand', numeric: false, label: 'Brand' },
      { id: 'location', numeric: false, label: 'Location' },
      { id: 'shared', numeric: false, label: 'Shared' },
      { id: 'condition', numeric: false, label: 'Condition' },
    ],
    filters: [
      {
        id:'profile',
        label: 'Profile',
        filters: [
          { id: 'location', label: 'Location', type: 'multi', size: 4 },
          { id: 'condition', label: 'Condition', type: 'multi', size: 4 },
          { id: 'registration_event.user', label: 'Registered By', type: 'multi', size: 4 },
          { id: 'brand', label: 'Brand', type: 'multi', size: 3 },
          { id: 'model', label: 'Model', type: 'multi' , size: 3 },
          { id: 'registration_event.date', label:{ min: 'Date Registered (From)', max: 'Date Registered (To)' }, type: 'range', kind: 'date', size: 3 },
        ]
      },{
        id: 'purchasing_info',
        label: 'Purchasing Info',
        filters: [
          { id: 'purchasing_info.supplier', label: 'Supplier', type: 'multi', size: 4 },
          { id: 'purchasing_info.price', label:{ min: 'Min. Price', max: 'Max. Price' }, type: 'range',  kind: 'number', size: 4},
          { id: 'purchasing_info.date',label:{ min: 'Date Purchased (From)', max: 'Date Purchased (To)' }, type: 'range',  kind: 'date', size: 3},
          { id: 'purchasing_info.warranty_exp',label:{ min: 'Warranty Expires (From)', max: 'Warranty Expires (To)' }, type: 'range',  kind: 'date', size: 3},
        ]
      },{
        id: 'grant',
        label: 'Grant Info',
        filters: [
          { id: 'grant.grant_number', label: 'Grant No.', type: 'multi', size: 4 },
          { id: 'grant.funding_agency', label: 'Funding Agency', type: 'multi', size: 4 },
          { id: 'grant.project_name', label: 'Project Name', type: 'multi', size: 4 },
        ]
      },{
        id: 'usage',
        label: 'Usage Info',
        filters: [
          { id: 'users', label: 'Users', type: 'multi', size: 4 },
          { id: 'shared', label: 'Shared', type: 'single', size: 4 },
          { id: 'training_required', label: 'Training Req.', type: 'single', size: 4 },
        ]
      },{
        id: 'maintenance_log',
        label: 'Maintenance Info',
        filters: [
          { id: 'maintenance_log.service', label: 'Service', type: 'multi', size: 6 },
          { id: 'maintenance_log.agent', label: 'Agent', type: 'multi', size: 6 },
          { id: 'maintenance_log.date', label:{ min: 'Events From', max: 'Events By' }, type: 'range',  kind: 'date', size: 3 },
          { id: 'maintenance_log.scheduled', label:{ min: 'Scheduled From', max: 'Scheduled By' }, type: 'range',  kind: 'date', size: 3 },
        ]
      }
    ]
  },{
    id: 'supplies',
    label: 'Supplies',
    component: null,
    category: 'Lab Supplies',
    tooltip: 'Add Supplies',
    cols: [
      { id: 'name', numeric: false, label: 'Name' },
      { id: 'shared', numeric: false, label: 'Shared' },
      { id: 'description', numeric: false, label: 'Description' },
    ],
    filters: [
      {
        id:'profile',
        label: 'Profile',
        filters: [
          { id: 'shared', label: 'Shared', type: 'single', size: 6 },
          { id: 'registration_event.user', label: 'Registered By', type: 'multi', size: 6 },
          { id: 'registration_event.date', label:{ min: 'Date Registered (From)', max: 'Date Registered (To)' }, type: 'range', kind: 'date', size: 6 },
        ]
      },{
        id: 'purchase_log',
        label: 'Resupply Info',
        filters: [
          { id: 'purchase_log.price', label:{ min: 'Min. Price', max: 'Max. Price' }, type: 'range',  kind: 'number', size: 4},
          { id: 'purchase_log.supplier', label: 'Supplier', type: 'multi', size: 4 },
          { id: 'purchase_log.date', label:{ min: 'Purchases From', max: 'Purchases By' }, type: 'range',  kind: 'date', size: 3 },
          { id: 'purchase_log.received', label:{ min: 'Received From', max: 'Received By' }, type: 'range',  kind: 'date', size: 3 },
        ]
      }
    ]
  }
];
class AssetTabs extends Component {
  constructor(props) {
    super(props);
    const index = tabs.map(tab => tab.id).indexOf(this.props.category);
    this.state = {
      value: index == -1 ? 0 : index
    };
    this.linkToAssetInfo = this.linkToAssetInfo.bind(this);
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

  linkToAssetInfo = (category) => (id) => () => this.props.history.push(`/assets/${category}/${id}#profile`);

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

    tabs.forEach(tab =>
      tab.component = (
        <GetAssets>
          { (getAssets, errors, clearErrors) => (
            <Fragment>
              <Tooltip title={tab.tooltip}>
                <Button
                  className={classes.addButton}
                  variant="fab"
                  color="primary"
                  aria-label="Add"
                  component={Link}
                  to={`/assets/${tab.id}/new`}>
                  <AddIcon />
                </Button>
              </Tooltip>
              <ExportAssetData>
                {
                  (mutate, exportErrors, clearExportErrors) =>
                    <Table
                      cols={tab.cols}
                      data={{
                        query: {
                          execute: async filter => {
                            let results = null;
                            let data = await getAssets(filter, null);
                            if (data) {
                              results = data.length ? data[0].results : [];
                            }
                            return results;
                          },
                        },
                        errors: errors[tab.id] !== undefined ? errors[tab.id] : errors,
                        clearErrors,
                      }}
                      defaultFilter={{ category: tab.category }}
                      filterOptions={(props)=><AssetFilterOptions category={tab.category} {...props} />}
                      filters={tab.filters}
                      title={tab.category}
                      onRowClick={this.linkToAssetInfo(tab.id)}
                      exportData={{
                        mutate: async input => {
                          input.search2 = input.search;
                          input.search = null;
                          let response = await mutate(input);
                          let fileURL = response !== undefined ? response.data.exportAssetData : null;
                          return fileURL;
                        },
                        errors:exportErrors,
                        clearErrors:clearExportErrors
                      }}
                    />
                }
              </ExportAssetData>
            </Fragment>
          )}
        </GetAssets>
      )
    );

    return  <Tabs tabs={tabs} value={this.state.value} onChange={this.handleChange} onChangeIndex={this.handleChangeIndex}/>;

  }
}

AssetTabs.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  category: PropTypes.string.isRequired
};

export default withStyles(styles)(withRouter(AssetTabs));
