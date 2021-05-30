import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SDSFilterOptions from './SDSFilterOptions';
import GetSafetyDataSheets from '../queries/GetSafetyDataSheets';
import ExportCompoundSafetyData from '../mutations/ExportCompoundSafetyData';
import SafetyQueryVariables from './SafetyQueryVariables';

import CachedTable from '../CachedTable';
import TableToolbar from '../TableToolbar';
import SafetyFilterGroups from './SafetyFilterGroups';

class SDSTable extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { cacheID, search, onRowClick } = this.props;
    return (
      <CachedTable
        cacheID={cacheID}
        cols={[
          { key: 'molblock', alphanumeric: false, label: 'Structure' },
          { key: 'name', alphanumeric: true, label: 'Name' },
          { key: 'manufacturer', alphanumeric: true, label: 'SDS Supplier' },
          { key: 'signal_word', alphanumeric: true, label: 'Signal Word' },
          { key: 'pictograms', alphanumeric: false, label: 'Pictograms' },
          { key: 'compound_id', alphanumeric: true, label: 'Compound ID' },
        ]}
        title="Safety Data Sheets"
        addButton={{
          link: '/safety/sds/new',
          tooltip: 'Add SDS',
        }}
        onRowClick={onRowClick}
        toolbar={TableToolbar}
        toolbarProps={{
          filterProps: {
            groups: SafetyFilterGroups,
            options: SDSFilterOptions
          },
          exportProps: {
            component: ExportCompoundSafetyData,
            getInput: ({ filter, search2, searchCategories }) =>
              ({ filter, search, search2, searchCategories })
          },
          getCustomProps: () => ({})
        }}
        query={{
          getQueryInput: ({ filter, pagination }) => {
            const { page, ...paginationInput } = pagination;
            return ({ filter, search, ...paginationInput });
          },
          getQueryOutput: data => data,
          component: GetSafetyDataSheets,
          variables: SafetyQueryVariables
        }}
      />
    );
  }
}

SDSTable.propTypes = {
  cacheID: PropTypes.string.isRequired,
  search: PropTypes.string,
  onRowClick: PropTypes.func.isRequired,
};

export default SDSTable;
