import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';
import PaginatedTable from './PaginatedTable';
import PaginatedDataTable from './PaginatedDataTable';
import { getFilter } from '../util/filter';

const styles = (theme) => ({
  addButton: {
    position: 'relative',
    float: 'right',
    left: theme.spacing.unit * 2,
    bottom: theme.spacing.unit * 2,
    zIndex: 1
  }
});

class CachedTable extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes, cols, title, addButton, onRowClick,
      cacheID, errorID, toolbar: Toolbar, toolbarProps, query,
    } = this.props;
    const { getQueryInput, getQueryOutput, defaultVariables,
      component: Query, variables: QueryVariables } = query;
    const { filterProps, exportProps, getCustomProps } = toolbarProps;
    const { groups: filterGroups, options: filterOptions } = filterProps;
    const { getInput: getExportInput, component: ExportData } = exportProps;
    return (
      <QueryVariables
        id={cacheID}>
        { (queryVariables, addQueryVariables, updateQueryVariables, initialized) => (
          <Query>
            { (queryData, queryErrors, clearErrors) => {
              const errors = queryErrors[errorID] !== undefined ? queryErrors[errorID] : queryErrors;
              const customToolbarProps = getCustomProps({ queryVariables, updateQueryVariables, initialized, errors, clearErrors });
              return (
                <ExportData>
                  { (exportData, exportErrors, clearExportErrors) => (
                    <div>
                      <Tooltip title={addButton.tooltip}>
                        <Fab
                          className={classes.addButton}
                          color="primary"
                          aria-label="Add"
                          component={Link}
                          to={addButton.link}>
                          <AddIcon />
                        </Fab>
                      </Tooltip>
                      <PaginatedDataTable
                        component={PaginatedTable}
                        tableProps={{
                          cols,
                          onRowClick
                        }}
                        onMount={ async () => {
                          await addQueryVariables(
                            {
                              searchCategories: cols.filter(c => c.alphanumeric).map(c => c.key),
                            });
                          if(defaultVariables !== undefined)
                            await updateQueryVariables(defaultVariables);
                        }}
                        fetchData={
                          async () => {
                            const {
                              filter: cacheFilter,
                              ...cachedQueryVariables
                            } = queryVariables;
                            const filter = getFilter(filterGroups, cacheFilter);
                            const filterOn = Object.keys(filter).length > 0;

                            cachedQueryVariables.filter = filter;
                            const input = getQueryInput(cachedQueryVariables);
                            let fetchPolicy = (!input.after && !input.before) ?
                              'network-only' : undefined;
                            let queryResult = await queryData(input, fetchPolicy);
                            const { pageInfo, data, totalCount } = queryResult;
                            let update = { filterOn };
                            if (cachedQueryVariables.search !== input.search) {
                              update.search = input.search;
                            }

                            if (!input.after && !input.before) {
                              update.resultsCount = totalCount;
                            }
                            await updateQueryVariables(update);

                            if (data && data.length) {
                              return getQueryOutput({ pageInfo, data, totalCount });
                            }
                            return ({ pageInfo, data, totalCount });
                          }
                        }
                        paginationOptions={{
                          paginationCount: queryVariables.resultsCount,
                          ...queryVariables.pagination
                        }}
                        onChangePageLimit={
                          async limit => {
                            const { first } = queryVariables.pagination;
                            let update = {};
                            if (first)
                              update = {
                                page: 0,
                                first: limit,
                                last: null,
                                after: null,
                                before: null
                              };
                            else {
                              update = {
                                page: 0,
                                first: null,
                                last: limit,
                                after: null,
                                before: null
                              };
                            }
                            await updateQueryVariables({
                              pagination: {
                                __typename: 'PaginationOptions',
                                ...update
                              }
                            });
                          }
                        }
                        onChangePage={
                          async (page, startCursor, endCursor) => {
                            const { first, last, page: currentPage } = queryVariables.pagination;
                            const currentLimit = first || last;
                            let update = {};
                            if (page > currentPage)
                              update = {
                                page,
                                first: currentLimit,
                                last: null,
                                after: endCursor,
                                before: null
                              };
                            if (page < currentPage)
                              update = {
                                page,
                                first: null,
                                last: currentLimit,
                                after: null,
                                before: startCursor
                              };
                            await updateQueryVariables({
                              pagination: {
                                __typename: 'PaginationOptions',
                                ...update
                              }
                            });
                          }
                        }
                        toolbar={Toolbar}
                        toolbarProps={{
                          title,
                          searchProps: {
                            onSubmit: ({ value, selectedCols }) => updateQueryVariables({
                              search2: value,
                              searchCategories: selectedCols
                            }),
                            initialized,
                            value: queryVariables.search2,
                            selectedCols: queryVariables.searchCategories,
                            cols: cols.filter(c=>c.alphanumeric)
                          },
                          exportProps: {
                            onSubmit: async name => {
                              const {
                                filter: cacheFilter,
                                ...cachedQueryVariables
                              } = queryVariables;
                              const filter = getFilter(filterGroups, cacheFilter);
                              cachedQueryVariables.filter = filter;
                              const input = getExportInput(cachedQueryVariables);
                              input.name = name;
                              let fileURL = await exportData(input);
                              return fileURL;
                            },
                            onClose: clearExportErrors,
                            errors: exportErrors,
                          },
                          filterProps: {
                            filterOn: queryVariables.filterOn,
                            filterGroups,
                            value: queryVariables.filter,
                            options: filterOptions,
                            onSubmit: async (filter, refetch, closeDialog) => {
                              const { first, last } = queryVariables.pagination;
                              const currentLimit = first || last;
                              await updateQueryVariables({
                                filter,
                                pagination: {
                                  __typename: 'PaginationOptions',
                                  page: 0,
                                  first: currentLimit,
                                  last: null,
                                  after: null,
                                  before: null
                                }
                              });
                              let success = await refetch();
                              if (success) {
                                closeDialog();
                              } else {
                                const { filter: cachedFilter, filterOn } = queryVariables;
                                await updateQueryVariables({ filter: cachedFilter, filterOn });
                              }
                            },
                            onReset: async (filter, refetch) => {
                              const { first, last } = queryVariables.pagination;
                              const currentLimit = first || last;
                              await updateQueryVariables({
                                filter,
                                pagination: {
                                  __typename: 'PaginationOptions',
                                  page: 0,
                                  first: currentLimit,
                                  last: null,
                                  after: null,
                                  before: null
                                }
                              });
                              let success = await refetch();
                              if (success) {
                                clearErrors();
                              }
                            },
                            onClose: clearErrors,
                            errors,
                          },
                          ...customToolbarProps
                        }}
                      />
                    </div>
                  )}
                </ExportData>
              );
            }}
          </Query>
        )}
      </QueryVariables>
    );
  }
}

CachedTable.propTypes = {
  classes: PropTypes.object.isRequired,
  cols: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  addButton: PropTypes.object.isRequired,
  onRowClick: PropTypes.func.isRequired,
  cacheID: PropTypes.string.isRequired,
  errorID: PropTypes.string,
  toolbar: PropTypes.func.isRequired,
  toolbarProps: PropTypes.object.isRequired,
  query: PropTypes.object.isRequired
};

export default withStyles(styles)(CachedTable);
