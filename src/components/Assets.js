import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';
import Table from './Table';

import GetAssets from './queries/GetAssets';
import Tabs from './Tabs';

const styles = (theme) => ({
  addButton: {
    position: 'relative',
    float: 'right',
    left: theme.spacing.unit,
    zIndex: 1
  }
});


class Assets extends Component {
  constructor(props) {
    super(props);
    this.linkToAssetInfo = this.linkToAssetInfo.bind(this);
  }

  linkToAssetInfo = (category) => (id) => () => this.props.history.push(`/assets/${category}/${id}`);

  render() {
    const { classes } = this.props;

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


    tabs[0].component = (
      <GetAssets>
        { (getAssets, errors, clearErrors) => (
          <Fragment>
            <Tooltip title={tabs[0].tooltip}>
              <Button
                className={classes.addButton}
                variant="fab"
                color="primary"
                aria-label="Add"
                component={Link}
                to={`/assets/${tabs[0].id}/new`}>
                <AddIcon />
              </Button>
            </Tooltip>
            <Table cols={tabs[0].cols} data={{ query: getAssets, errors, clearErrors, filterType: { type: 'asset', category: tabs[0].category } }} defaultFilter={{category: tabs[0].category }} filters={tabs[0].filters} title={tabs[0].category} onRowClick={this.linkToAssetInfo(tabs[0].id)}/>
          </Fragment>
        )}
      </GetAssets>
    );

    tabs[1].component = (
      <GetAssets>
        { (getAssets, errors, clearErrors) => (
          <Fragment>
            <Tooltip title={tabs[1].tooltip}>
              <Button
                className={classes.addButton}
                variant="fab"
                color="primary"
                aria-label="Add"
                component={Link}
                to={`/assets/${tabs[1].id}/new`}>
                <AddIcon />
              </Button>
            </Tooltip>
            <Table cols={tabs[1].cols} data={{ query: getAssets, errors, clearErrors, filterType: { type: 'asset', category: tabs[1].category } }} defaultFilter={{category: tabs[1].category }} filters={tabs[1].filters} title={tabs[1].category} onRowClick={this.linkToAssetInfo(tabs[1].id)}/>
          </Fragment>
        )}
      </GetAssets>
    );

    return  <Tabs tabs={tabs} />;

  }
}

Assets.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,

};

export default withStyles(styles)(withRouter(Assets));
