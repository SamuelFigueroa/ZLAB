import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';

class PaginatedTableHead extends Component {
  constructor(props) {
    super(props);
    this.createSortHandler = this.createSortHandler.bind(this);
  }

  createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  };

  render() {
    const { cols, order, orderBy } = this.props;

    return (
      <TableHead>
        <TableRow>
          {cols.map(col => {
            return (
              <TableCell
                key={col.key}
                sortDirection={orderBy === col.key ? order : false}
              >
                { col.alphanumeric ? (
                  <Tooltip
                    title="Sort"
                    placement="bottom-start"
                    enterDelay={300}
                  >
                    <TableSortLabel
                      active={orderBy === col.key}
                      direction={order}
                      onClick={this.createSortHandler(col.key)}
                    >
                      {col.label}
                    </TableSortLabel>
                  </Tooltip>
                ) : col.label }
              </TableCell>
            );
          }, this)}
        </TableRow>
      </TableHead>
    );
  }
}

PaginatedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  cols: PropTypes.array.isRequired,
};

const styles = theme => ({
  tableWrapper: {
    overflowX: 'auto',
  },
  chip: {
    margin: theme.spacing.unit
  },
  cell: {
    maxWidth: 200,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  }
});

class PaginatedTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      order: 'desc',
      orderBy: this.props.cols.filter(c => c.alphanumeric)[0].key,
    };
    this.getSorting = this.getSorting.bind(this);
    this.handleRequestSort = this.handleRequestSort.bind(this);
    this.handleChangePage = this.handleChangePage.bind(this);
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);
  }

  static contextTypes = {
    swipeableViews: PropTypes.object,
  };

  componentDidUpdate() {
    if(this.context.swipeableViews !== undefined)
      this.context.swipeableViews.slideUpdateHeight();
  }

  componentDidMount() {
    if(this.context.swipeableViews !== undefined)
      this.context.swipeableViews.slideUpdateHeight();
  }

  getSorting = (order, orderBy) => {
    return order === 'desc' ? (a, b) => '' + b[orderBy].localeCompare(a[orderBy]) : (a, b) => '' + a[orderBy].localeCompare(b[orderBy]);
  }

  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({ order, orderBy });
  };

  handleChangePage = (event, page) => {
    const { handleChangePage } = this.props;
    handleChangePage(page);
  };

  handleChangeRowsPerPage = event => {
    const { handleChangeRowsPerPage } = this.props;
    const rowsPerPage = event.target.value;
    handleChangeRowsPerPage(rowsPerPage);
  };

  render() {
    const { classes, cols, onRowClick, toolbar, data, pageInfo, paginationCount } = this.props;
    const { order, orderBy } = this.state;
    return (
      <Paper className={classes.root}>
        { toolbar === undefined ? null : toolbar }
        <div className={classes.tableWrapper}>
          <Table className={classes.table} aria-labelledby="tableTitle">
            <PaginatedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={this.handleRequestSort}
              cols={cols}
            />
            <TableBody>
              { data
                .sort(this.getSorting(order, orderBy))
                .map(n => {
                  return (
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={n.id}
                      onClick={onRowClick(n.id)}
                    >
                      {cols.map(col => (
                        <TableCell
                          className={classes.cell}
                          padding="dense"
                          component={col.key == 'name' ? 'th' : 'td'}
                          scope={col.key == 'name' ? 'row' : 'col'}
                          key={col.key}>
                          {n[col.key] == '' ? 'N/A' : n[col.key]}
                        </TableCell>
                      )
                      )}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          component="div"
          style={{ overflowX: 'auto' }}
          count={paginationCount}
          rowsPerPage={pageInfo.limit}
          rowsPerPageOptions={[5, 25, 50, 100]}
          page={pageInfo.page}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
            disabled: pageInfo.loading || !pageInfo.hasPreviousPage
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
            disabled: pageInfo.loading || !pageInfo.hasNextPage
          }}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Paper>
    );
  }
}

PaginatedTable.propTypes = {
  classes: PropTypes.object.isRequired,
  cols: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  onRowClick: PropTypes.func.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  toolbar: PropTypes.object,
  pageInfo: PropTypes.object.isRequired,
  paginationCount: PropTypes.number.isRequired
};

export default withStyles(styles)(PaginatedTable);
