import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';
import Table from './Table';
import DataTable from './DataTable';
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
                      <DataTable
                        component={Table}
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
                            let data = await queryData(input);
                            let update = { filterOn };
                            if(cachedQueryVariables.search !== input.search) {
                              update.search = input.search;
                              update.resultsCount = data ? data.length : 0;
                            }
                            await updateQueryVariables(update);

                            if (data && data.length) {
                              return getQueryOutput(data);
                            }
                            return data;
                          }}
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
                              await updateQueryVariables({ filter });
                              let success = await refetch();
                              if (success) {
                                closeDialog();
                              } else {
                                const { filter: cachedFilter, filterOn } = queryVariables;
                                await updateQueryVariables({ filter: cachedFilter, filterOn });
                              }
                            },
                            onReset: async (filter, refetch) => {
                              await updateQueryVariables({ filter });
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
