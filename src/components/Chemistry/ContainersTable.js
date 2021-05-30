import React, { Component } from 'react';
import PropTypes from 'prop-types';

import CompoundFilterOptions from './CompoundFilterOptions';
import GetContainerInventory from '../queries/GetContainerInventory';
import ExportContainerData from '../mutations/ExportContainerData';
import ChemistryQueryVariables from './ChemistryQueryVariables';

import CachedTable from '../CachedTable';
import ChemistryTableToolbar from './ChemistryTableToolbar';
import ChemistryFilterGroups from './ChemistryFilterGroups';

class ContainersTable extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { cacheID, search, onRowClick } = this.props;
    return (
      <CachedTable
        cacheID={cacheID}
        errorID="containers"
        cols={[
          { key: 'molblock', alphanumeric: false, label: 'Structure' },
          { key: 'barcode', alphanumeric: true, label: 'Barcode' },
          { key: 'batch_id', alphanumeric: true, label: 'Batch ID' },
          { key: 'source', alphanumeric: true, label: 'Source' },
          { key: 'source_id', alphanumeric: true, label: 'Source ID' },
          { key: 'amount', alphanumeric: true, label: 'Amount' },
          { key: 'location', alphanumeric: true, label: 'Location' },
        ]}
        title="Containers"
        addButton={{
          link: '/chemistry/containers/register',
          tooltip: 'Add Container',
        }}
        onRowClick={onRowClick}
        toolbar={ChemistryTableToolbar}
        toolbarProps={{
          filterProps: {
            groups: ChemistryFilterGroups,
            options: CompoundFilterOptions
          },
          exportProps: {
            component: ExportContainerData,
            getInput: ({ filter, search2, searchCategories,
              substructurePattern: pattern,
              substructureRemoveHs: removeHs
            }) => {
              if(pattern)
                filter.substructure = { pattern, removeHs };
              return ({ filter, search, search2, searchCategories });
            }
          },
          getCustomProps: ({ queryVariables, updateQueryVariables, initialized, errors, clearErrors }) => ({
            substructureProps : {
              initialized,
              molblock: queryVariables.substructurePattern,
              removeHs: queryVariables.substructureRemoveHs,
              onSubmit: async ({ molblock, removeHs }, refetch, closeDialog)=> {
                const { first, last } = queryVariables.pagination;
                const currentLimit = first || last;
                await updateQueryVariables({
                  pagination: {
                    __typename: 'PaginationOptions',
                    page: 0,
                    first: currentLimit,
                    last: null,
                    after: null,
                    before: null
                  },
                  substructurePattern: molblock,
                  substructureRemoveHs: removeHs });
                let success = await refetch();
                if (success) {
                  closeDialog();
                } else {
                  const { substructurePattern, substructureRemoveHs } = queryVariables;
                  await updateQueryVariables({ substructurePattern, substructureRemoveHs });
                }
              },
              onClose: clearErrors,
              errors,
            }
          })
        }}
        query={{
          getQueryInput: ({ filter, pagination,
            substructurePattern: pattern,
            substructureRemoveHs: removeHs
          }) => {
            const { page, ...paginationInput } = pagination;
            if(pattern)
              filter.substructure = { pattern, removeHs };
            return ({ filter, search, ...paginationInput  });
          },
          getQueryOutput: ({ data, pageInfo, totalCount }) => {
            const formatted_containers = data.map(container => ({
              ...container,
              location: (container.location.area.name == 'UNASSIGNED') ?
                'UNASSIGNED' : `${container.location.area.name} / ${container.location.sub_area.name}`,
              source: container.vendor ? container.vendor : container.institution,
              source_id: container.vendor ? container.catalog_id : (
                container.category == 'Sample' ?  `${container.researcher} / ${container.eln_id}` :
                  container.researcher
              ),
              amount: container.state == 'S' ? `${container.mass} ${container.mass_units}` : (
                container.state == 'L' ? `${container.volume} ${container.vol_units}` :
                  `${container.volume} ${container.vol_units} / ${container.concentration} ${container.conc_units}`
              )
            }));
            return { data: formatted_containers, pageInfo, totalCount };
          },
          component: GetContainerInventory,
          variables: ChemistryQueryVariables
        }}
      />
    );
  }
}

ContainersTable.propTypes = {
  cacheID: PropTypes.string.isRequired,
  search: PropTypes.string,
  onRowClick: PropTypes.func.isRequired,
};

export default ContainersTable;
