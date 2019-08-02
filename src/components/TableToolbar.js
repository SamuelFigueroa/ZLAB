import React from 'react';
import PropTypes from 'prop-types';

import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TableExport from './TableExport';
import TableSearchBar from './TableSearchBar';
import TableFilter from './TableFilter';

const TableToolbar = props => {
  const { title, rightHeader, subheading, custom, refetch, searchProps, filterProps, exportProps } = props;

  return (
    <Toolbar>
      <Grid container
        alignItems="center"
        justify="flex-start"
        spacing={16}
      >
        <Grid item>
          <Typography variant="h5" color="primary" id="tableTitle">
            {title}
          </Typography>
        </Grid>
        {
          searchProps !== undefined ? (
            <Grid item sm={4} xs={6}>
              <TableSearchBar {...searchProps} />
            </Grid>
          ) : null }
        {
          filterProps !== undefined ? (
            <Grid item>
              <TableFilter refetch={refetch} {...filterProps}/>
            </Grid>
          ) : null }
        {
          exportProps !== undefined ? (
            <Grid item>
              <TableExport {...exportProps} />
            </Grid>
          ) : null }
        {
          custom !== undefined ?
            custom.map( action =>
              <Grid item key={action.key}>
                {action}
              </Grid>
            ) : null
        }
        {
          subheading ? (
            <Grid item xs={4}>
              <Typography variant="h5" color="textSecondary">
                {subheading}
              </Typography>
            </Grid>
          ): null
        }
        { rightHeader ? rightHeader: null }
      </Grid>
    </Toolbar>
  );
};

TableToolbar.propTypes = {
  title: PropTypes.string.isRequired,
  subheading: PropTypes.string,
  refetch: PropTypes.func,
  custom: PropTypes.array,
  searchProps: PropTypes.object,
  filterProps: PropTypes.object,
  exportProps: PropTypes.object,
  rightHeader: PropTypes.object
};

export default TableToolbar;
