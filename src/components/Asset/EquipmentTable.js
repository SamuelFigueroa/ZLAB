import React, { Component } from 'react';
import PropTypes from 'prop-types';

import AssetFilterOptions from './AssetFilterOptions';
import GetAssetInventory from '../queries/GetAssetInventory';
import ExportAssetData from '../mutations/ExportAssetData';
import AssetQueryVariables from './AssetQueryVariables';

import CachedTable from '../CachedTable';
import TableToolbar from '../TableToolbar';
import { EquipmentFilterGroups } from './AssetFilterGroups';

class EquipmentTable extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { cacheID, search, onRowClick } = this.props;
    return (
      <CachedTable
        cacheID={cacheID}
        errorID="equipment"
        cols={[
          { key: 'name', alphanumeric: true, label: 'Name' },
          { key: 'barcode', alphanumeric: true, label: 'Barcode' },
          { key: 'model', alphanumeric: true, label: 'Model' },
          { key: 'brand', alphanumeric: true, label: 'Brand' },
          { key: 'location', alphanumeric: true, label: 'Location' },
          { key: 'shared', alphanumeric: true, label: 'Shared' },
          { key: 'condition', alphanumeric: true, label: 'Condition' },
        ]}
        title="Equipment"
        addButton={{
          link: '/assets/equipment/new',
          tooltip: 'Add Equipment',
        }}
        onRowClick={onRowClick('equipment')}
        toolbar={TableToolbar}
        toolbarProps={{
          filterProps: {
            groups: EquipmentFilterGroups,
            options: (props)=><AssetFilterOptions category="Lab Equipment" {...props} />
          },
          exportProps: {
            component: ExportAssetData,
            getInput: ({ filter, search2, searchCategories }) => {
              filter.category = 'Lab Equipment';
              return ({ filter, search, search2, searchCategories });
            }
          },
          getCustomProps: () => ({})
        }}
        query={{
          getQueryInput: ({ filter, pagination }) => {
            const { page, ...paginationInput } = pagination;
            filter.category = 'Lab Equipment';
            return ({ filter, search, ...paginationInput });
          },
          getQueryOutput: data => data,
          component: GetAssetInventory,
          variables: AssetQueryVariables
        }}
      />
    );
  }
}

EquipmentTable.propTypes = {
  cacheID: PropTypes.string.isRequired,
  search: PropTypes.string,
  onRowClick: PropTypes.func.isRequired,
};

export default EquipmentTable;
