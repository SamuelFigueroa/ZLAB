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
        ]},
      {
        id: 'supplies',
        label: 'Supplies',
        component: null,
        category: 'Lab Supplies',
        tooltip: 'Add Supplies',
        cols: [
          { id: 'name', numeric: false, label: 'Name' },
          { id: 'shared', numeric: false, label: 'Shared' },
          { id: 'description', numeric: false, label: 'Description' },
        ]
      }
    ];

    tabs[0].component = (
      <GetAssets category={tabs[0].category}>
        { assets => (
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
            <Table cols={tabs[0].cols} data={assets} title={tabs[0].category} onRowClick={this.linkToAssetInfo(tabs[0].id)}/>
          </Fragment>
        )}
      </GetAssets>
    );

    tabs[1].component = (
      <GetAssets category={tabs[1].category}>
        { assets => (
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
            <Table cols={tabs[1].cols} data={assets} title={tabs[1].category} onRowClick={this.linkToAssetInfo(tabs[1].id)}/>
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
