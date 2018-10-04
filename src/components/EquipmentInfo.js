import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import green from '@material-ui/core/colors/green';
import EditIcon from '@material-ui/icons/Edit';

import GetAsset from './queries/GetAsset';
import DeleteAsset from './mutations/DeleteAsset';
import Tabs from './Tabs';
import MaintenanceLog from './MaintenanceLog';
import DocumentLog from './DocumentLog';


const formatCurrency = (n) => new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD' }).format(n);
const dateToString = (d) => {
  const date = new Date(d);
  date.setHours(date.getHours() + (date.getTimezoneOffset() / 60));
  return date.toLocaleDateString('en-US');
};
const dateTimeToString = (d) => {
  const date = new Date(d);
  date.setHours(date.getHours() - (date.getTimezoneOffset() / 60));
  return date.toLocaleDateString('en-US');
};

const styles = (theme) => ({
  addButton: {
    float: 'right',
    position: 'relative',
    left: theme.spacing.unit * 2,
    zIndex: 10
  },
  root: {
    paddingTop: theme.spacing.unit * 2,
  },
  // container: {
  //   display: 'flex',
  //   flexWrap: 'wrap'
  // },
  assetProfile: {
    padding: theme.spacing.unit * 5,
  },
  registerButton: {
    paddingTop: theme.spacing.unit * 2
  },
  input: {
    display: 'none',
  },
  headerSection: {
    paddingBottom: theme.spacing * 5
  },
  assetHeadline: {
    paddingLeft: theme.spacing.unit * 3
  },
  fabGreen: {
    position: 'absolute',
    right: theme.spacing.unit * 4,
    top: theme.spacing.unit * 2,
    zIndex: 10,
    color: theme.palette.common.white,
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    }
  },
  sectionTitle: {
    paddingTop: theme.spacing.unit * 3
  }
});


class EquipmentInfo extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes, id, user, isAuthenticated } = this.props;

    const tabs = [
      { id: 'profile', label: 'Profile', component: null },
      { id: 'documents', label: 'Documents', component: null},
      { id: 'maintenance', label: 'Maintenance Log', component: null },
    ];

    isAuthenticated && tabs.push({ id: 'actions', label: 'Actions', component: null });

    return (
      <GetAsset id={id}>
        { asset => {
          tabs[0]['component'] = (
            <div className={classes.root}>
              <Tooltip title={`Edit ${asset.category} Information`}>
                <Button variant="fab" className={classes.fabGreen} color="inherit" component={Link} to={`/assets/equipment/${asset.id}/update`}>
                  <EditIcon />
                </Button>
              </Tooltip>
              <Grid
                container
                className={classes.container}
                spacing={32}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subheading">
                      Name: {asset.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subheading">
                      Location: {(asset.location.area.name == 'UNASSIGNED') ?
                      'UNASSIGNED' : `${asset.location.area.name} / ${asset.location.sub_area.name}`}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subheading">
                      Barcode: {asset.barcode}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subheading">
                      Condition: {asset.condition}
                  </Typography>
                </Grid>
                {
                  asset.brand && asset.model ? (
                    <Grid item xs={12}>
                      <Typography variant="subheading">
                      Brand / Model: {`${asset.brand} / ${asset.model}`}
                      </Typography>
                    </Grid>
                  ) : (
                    asset.brand ? (
                      <Grid item xs={12}>
                        <Typography variant="subheading">
                        Brand: {asset.brand}
                        </Typography>
                      </Grid>
                    ) : (
                      asset.model ? (
                        <Grid item xs={12}>
                          <Typography variant="subheading">
                        Model: {asset.model}
                          </Typography>
                        </Grid>
                      ) : (null)
                    )
                  )}
                {
                  asset.serial_number ? (
                    <Grid item xs={12}>
                      <Typography variant="subheading">
                          Serial No.: {asset.serial_number}
                      </Typography>
                    </Grid>
                  ) : (null)
                }
                {
                  asset.description ? (
                    <Grid item xs={12}>
                      <Typography variant="subheading" gutterBottom>
                          Description:
                      </Typography>
                      <Typography variant="subheading">
                        {asset.description}
                      </Typography>
                    </Grid>
                  ) : (null)
                }
                <Grid item xs={12}>
                  <Typography variant="title" color="textSecondary" className={classes.sectionTitle}>
                  Funding Information
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subheading">
                    Purchase Date: { dateToString(asset.purchasing_info.date)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subheading">
                    Supplier: {asset.purchasing_info.supplier}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subheading">
                    Price: { formatCurrency(asset.purchasing_info.price) }
                  </Typography>
                </Grid>
                {
                  asset.purchasing_info.warranty_exp ? (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subheading">
                        Warranty Expires: { dateToString(asset.purchasing_info.warranty_exp) }
                      </Typography>
                    </Grid>
                  ) : (null)
                }
                <Grid item xs={12} sm={6}>
                  <Typography variant="subheading">
                    Grant No.: {asset.grant.grant_number}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subheading">
                    Project Name: {asset.grant.project_name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subheading">
                    Funding Agency: {asset.grant.funding_agency}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subheading" color="textSecondary" align="right">
                      Registered by {asset.registration_event.user} on {dateTimeToString(asset.registration_event.date)}
                  </Typography>
                </Grid>
              </Grid>
            </div>
          );
          tabs[1]['component'] = (
            <DocumentLog docs={asset.documents} user={user} assetID={asset.id} assetHeadline={`${asset.category}: ${asset.name}`}/>
          );
          tabs[2]['component'] = (
            <MaintenanceLog events={asset.maintenance_log} assetID={asset.id} assetHeadline={`${asset.category}: ${asset.name}`}/>
          );
          if(isAuthenticated) {
            tabs[3]['component'] = (
              <DeleteAsset>
                {
                  deleteAsset => (
                    <Grid
                      container
                      alignItems="center"
                      justify="center">
                      <Grid item xs={4}>
                        <Button variant="contained" fullWidth onClick={() => deleteAsset(asset.id, asset.category)} color="secondary" className={classes.delete}>
                        Delete {`${asset.category}`}
                        </Button>
                      </Grid>
                    </Grid>
                  )
                }
              </DeleteAsset>
            );
          }
          return (
            <Tabs tabs={tabs}/>
          );
        }}
      </GetAsset>
    );
  }
}

EquipmentInfo.propTypes = {
  classes: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
};

export default withStyles(styles)(EquipmentInfo);
