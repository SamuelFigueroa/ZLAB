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
import AssetFilterOptions from './AssetFilterOptions';
import GetAssets from '../queries/GetAssets';
import ExportAssetData from '../mutations/ExportAssetData';

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
    id: 'equipment',
    route: 'equipment',
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
    route: 'consumables',
    label: 'Consumables',
    component: null,
    category: 'Lab Supplies',
    tooltip: 'Add Consumables',
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
class AssetSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: {
        equipment: null,
        supplies: null,
      },
      queryExecuted: false
    };
    this.linkToAssetInfo = this.linkToAssetInfo.bind(this);
  }

  async componentDidMount() {
    let data = await this.props.data.query(null, this.props.search);
    let state = { queryExecuted: true };
    if (data) {
      state.results = {};
      data.forEach( item => {
        if(item.category == 'Lab Equipment')
          state.results.equipment = item.results;
        else {
          state.results.supplies = item.results;
        }
      });
    }
    return this.setState(state);
  }

  linkToAssetInfo = (category) => (id) => () => this.props.history.push(`/assets/${category}/${id}#profile`);

  render() {
    const { classes } = this.props;
    const { queryExecuted } = this.state;

    queryExecuted &&
    tables.forEach( table => {
      if (this.state.results[table.id]) {
        table.component = (
          <GetAssets>
            { (getAssets, errors, clearErrors) => (
              <Fragment>
                <Tooltip title={table.tooltip}>
                  <Button
                    className={classes.addButton}
                    variant="fab"
                    color="primary"
                    aria-label="Add"
                    component={Link}
                    to={`/assets/${table.id}/new`}>
                    <AddIcon />
                  </Button>
                </Tooltip>
                <ExportAssetData>
                  {
                    (mutate, exportErrors, clearExportErrors) =>
                      <Table
                        cols={table.cols}
                        data={{
                          query: {
                            execute: async filter => {
                              if(Object.keys(filter).length == 1)
                                return this.state.results[table.id];
                              let results = null;
                              let data = await getAssets(filter, this.props.search);
                              if (data) {
                                results = data.length ? data[0].results : [];
                              }
                              return results;
                            },
                          },
                          errors: errors[table.id] !== undefined ? errors[table.id] : errors,
                          clearErrors,
                        }}
                        defaultFilter={{ category: table.category }}
                        filterOptions={(props)=><AssetFilterOptions category={table.category} {...props} />}
                        filters={table.filters}
                        title={table.label}
                        onRowClick={this.linkToAssetInfo(table.route)}
                        exportData={{
                          mutate: async input => {
                            input.search2 = input.search;
                            input.search = this.props.search;
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

AssetSearch.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  search: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired
};

export default withStyles(styles)(withRouter(AssetSearch));
