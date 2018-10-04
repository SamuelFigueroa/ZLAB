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
import PurchaseLog from './PurchaseLog';
import DocumentLog from './DocumentLog';

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

const dateTimeToString = (d) => {
  const date = new Date(d);
  date.setHours(date.getHours() - (date.getTimezoneOffset() / 60));
  return date.toLocaleDateString('en-US');
};

class SupplyInfo extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes, id, user, isAuthenticated } = this.props;

    const tabs = [
      { id: 'profile', label: 'Profile', component: null },
      { id: 'documents', label: 'Documents', component: null},
      { id: 'purchasing', label: 'Purchasing Log', component: null },
    ];

    isAuthenticated && tabs.push({ id: 'actions', label: 'Actions', component: null });

    return (
      <GetAsset id={id}>
        { asset => {
          tabs[0]['component'] = (
            <div className={classes.root}>
              <Tooltip title={`Edit ${asset.category} Information`}>
                <Button variant="fab" className={classes.fabGreen} color="inherit" component={Link} to={`/assets/supplies/${asset.id}/update`}>
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
            <PurchaseLog events={asset.purchase_log} assetID={asset.id} assetHeadline={`${asset.category}: ${asset.name}`}/>
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
                        Delete Lab Supply
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

SupplyInfo.propTypes = {
  classes: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
};

export default withStyles(styles)(SupplyInfo);
