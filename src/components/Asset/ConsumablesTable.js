import React, { Component } from 'react';
import PropTypes from 'prop-types';

import AssetFilterOptions from './AssetFilterOptions';
import GetAssets from '../queries/GetAssets';
import ExportAssetData from '../mutations/ExportAssetData';
import AssetQueryVariables from './AssetQueryVariables';

import CachedTable from '../CachedTable';
import TableToolbar from '../TableToolbar';
import { ConsumablesFilterGroups } from './AssetFilterGroups';

class ConsumablesTable extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { cacheID, search, onRowClick } = this.props;
    return (
      <CachedTable
        cacheID={cacheID}
        errorID="consumables"
        cols={[
          { key: 'name', alphanumeric: true, label: 'Name' },
          { key: 'shared', alphanumeric: true, label: 'Shared' },
          { key: 'description', alphanumeric: true, label: 'Description' },
        ]}
        title="Consumables"
        addButton={{
          link: '/assets/consumables/new',
          tooltip: 'Add Consumables',
        }}
        onRowClick={onRowClick('consumables')}
        toolbar={TableToolbar}
        toolbarProps={{
          filterProps: {
            groups: ConsumablesFilterGroups,
            options: (props)=><AssetFilterOptions category="Lab Supplies" {...props} />
          },
          exportProps: {
            component: ExportAssetData,
            getInput: ({ filter, search2, searchCategories }) => {
              filter.category = 'Lab Supplies';
              return ({ filter, search, search2, searchCategories });
            }
          },
          getCustomProps: () => ({})
        }}
        query={{
          getQueryInput: ({ filter }) => {
            filter.category = 'Lab Supplies';
            return ({ filter, search });
          },
          getQueryOutput: data => data[0].results,
          component: GetAssets,
          variables: AssetQueryVariables
        }}
      />
    );
  }
}

ConsumablesTable.propTypes = {
  cacheID: PropTypes.string.isRequired,
  search: PropTypes.string,
  onRowClick: PropTypes.func.isRequired,
};

export default ConsumablesTable;
