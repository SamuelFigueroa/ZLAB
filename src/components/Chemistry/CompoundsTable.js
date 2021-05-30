import React, { Component } from 'react';
import PropTypes from 'prop-types';

import CompoundFilterOptions from './CompoundFilterOptions';
import GetCompoundInventory from '../queries/GetCompoundInventory';
import ExportCompoundData from '../mutations/ExportCompoundData';
import ChemistryQueryVariables from './ChemistryQueryVariables';

import CachedTable from '../CachedTable';
import ChemistryTableToolbar from './ChemistryTableToolbar';
import ChemistryFilterGroups from './ChemistryFilterGroups';

class CompoundsTable extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { cacheID, search, withSDS, onRowClick } = this.props;
    return (
      <CachedTable
        cacheID={cacheID}
        errorID="compounds"
        cols={[
          { key: 'molblock', alphanumeric: false, label: 'Structure' },
          { key: 'compound_id', alphanumeric: true, label: 'Compound ID' },
          { key: 'name', alphanumeric: true, label: 'Name' },
          { key: 'cas', alphanumeric: true, label: 'CAS No.' },
          { key: 'storage', alphanumeric: true, label: 'Storage' },
          { key: 'smiles', alphanumeric: true, label: 'SMILES' },
        ]}
        title="Compounds"
        addButton={{
          link: '/chemistry/compounds/register',
          tooltip: 'Add Compound',
        }}
        onRowClick={onRowClick}
        toolbar={ChemistryTableToolbar}
        toolbarProps={{
          filterProps: {
            groups: ChemistryFilterGroups,
            options: CompoundFilterOptions,
          },
          exportProps: {
            component: ExportCompoundData,
            getInput: ({ filter, search2, searchCategories,
              substructurePattern: pattern,
              substructureRemoveHs: removeHs
            }) => {
              if(pattern)
                filter.substructure = { pattern, removeHs };
              return ({ filter, search, withSDS, search2, searchCategories });
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
                  substructureRemoveHs: removeHs
                });
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
            return ({ filter, search, withSDS, ...paginationInput });
          },
          getQueryOutput: data => data,
          component: GetCompoundInventory,
          variables: ChemistryQueryVariables,
          defaultVariables: withSDS === false ? ({
            filter: {
              __typename: 'ChemistryFilter',
              containerCategory: [['Reagent', 'Reagent']]
            }
          }) : undefined
        }}
      />
    );
  }
}

CompoundsTable.propTypes = {
  cacheID: PropTypes.string.isRequired,
  search: PropTypes.string,
  withSDS: PropTypes.bool,
  onRowClick: PropTypes.func.isRequired,
};

export default CompoundsTable;
