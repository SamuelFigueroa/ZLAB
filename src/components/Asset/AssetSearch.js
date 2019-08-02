import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import EquipmentTable from './EquipmentTable';
import ConsumablesTable from './ConsumablesTable';

const styles = (theme) => ({
  root: {
    paddingTop: theme.spacing.unit * 3,
  }
});

const tables = [
  {
    id: 'equipment',
    label: 'Equipment',
    component: null,
  },{
    id: 'consumables',
    label: 'Consumables',
    component: null,
  }
];
class AssetSearch extends Component {
  constructor(props) {
    super(props);
    this.linkToAssetInfo = this.linkToAssetInfo.bind(this);
  }
  linkToAssetInfo = (category) => (id) => () => this.props.history.push(`/assets/${category}/${id}#profile`);

  render() {
    const { classes, initialized, results } = this.props;

    tables[0].component = (
      <EquipmentTable
        cacheID="search_equipment"
        onRowClick={this.linkToAssetInfo}
        search={this.props.search}
      />
    );
    tables[1].component = (
      <ConsumablesTable
        cacheID="search_consumables"
        onRowClick={this.linkToAssetInfo}
        search={this.props.search}
      />
    );

    return (
      <div className={classes.root}>
        {
          <Grid container spacing={8}>
            { !initialized ? (
              <Grid item xs={12}>
                <Typography align="center" variant="h4" gutterBottom>
                  {`Searching for '${this.props.search}'...`}
                </Typography>
              </Grid>
            ) : null }
            { initialized && results.equipment === 0 && results.consumables === 0 ? (
              <Grid item xs={12}>
                <Typography align="center" variant="h4" gutterBottom>
                  {`Search '${this.props.search}' did not match any documents.`}
                </Typography>
              </Grid>
            ) :  null }
            <Grid item xs={12}>
              <Grid container spacing={8}>
                { initialized && !(results.equipment === 0 && results.consumables === 0) ? (
                  <Grid item xs={12}>
                    <Typography variant="h5">
                      {`Search results: '${this.props.search}'`}
                    </Typography>
                  </Grid>
                ) : null }
                <Grid item xs={12}>
                  {
                    tables.map( table => (
                      <Grid key={table.id} style={{ display: (initialized && !(results[table.id] === 0)) ? 'block' : 'none' }} item xs={12}>
                        {table.component}
                      </Grid>
                    ))
                  }
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        }
      </div>
    );
  }
}

AssetSearch.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  search: PropTypes.string.isRequired,
  initialized: PropTypes.bool.isRequired,
  results: PropTypes.object.isRequired
};

export default withStyles(styles)(withRouter(AssetSearch));
