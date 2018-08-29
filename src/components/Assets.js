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
    position: 'absolute',
    right: theme.spacing.unit,
    zIndex: 1
  }
});


class Assets extends Component {
  constructor(props) {
    super(props);
    this.linkToAssetInfo = this.linkToAssetInfo.bind(this);
  }

  linkToAssetInfo = (id) => () => this.props.history.push(`/assets/${id}`);

  render() {
    const { classes } = this.props;

    const tabs = [
      { id: 'equipment', label: 'Equipment', component: null },
      { id: 'supplies', label: 'Supplies', component: null }
    ];

    const equipmentCols = [
      { id: 'name', numeric: false, label: 'Name' },
      { id: 'barcode', numeric: false, label: 'Barcode' },
      { id: 'model', numeric: false, label: 'Model' },
      { id: 'brand', numeric: false, label: 'Brand' },
      { id: 'location', numeric: false, label: 'Location' },
      { id: 'shared', numeric: false, label: 'Shared' },
      { id: 'condition', numeric: false, label: 'Condition' },
    ];

    return (
      <GetAssets>
        { assets => {
          tabs[0]['component'] = (
            <Fragment>
              <Tooltip title="Add Equipment">
                <Button
                  className={classes.addButton}
                  variant="fab"
                  color="primary"
                  aria-label="Add"
                  component={Link}
                  to="/assets/new">
                  <AddIcon />
                </Button>
              </Tooltip>
              <Table cols={equipmentCols} data={assets} title="Lab Equipment" onRowClick={this.linkToAssetInfo}/>
            </Fragment>
          );
          return <Tabs tabs={tabs} />;
        }}
      </GetAssets>
    );
  }
}

Assets.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,

};

export default withStyles(styles)(withRouter(Assets));
