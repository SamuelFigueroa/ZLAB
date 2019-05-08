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
import Radio from '@material-ui/core/Radio';

class REnhancedTableHead extends Component {
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
          <TableCell padding="checkbox">
            <Radio
              disabled={true}
            />
          </TableCell>
          {cols.map(col => {
            return (
              <TableCell
                key={col.key}
                numeric={false}
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

REnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  cols: PropTypes.array.isRequired,
};

const styles = theme => ({
  root: {
    marginTop: theme.spacing.unit * 3,
  },
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

class RadioTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      order: 'asc',
      orderBy: this.props.cols.filter(c => c.alphanumeric)[0].key,
      page: 0,
      rowsPerPage: 25,
    };
    this.getSorting = this.getSorting.bind(this);
    this.handleRequestSort = this.handleRequestSort.bind(this);
    this.handleChangePage = this.handleChangePage.bind(this);
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);
  }

  static contextTypes = {
    swipeableViews: PropTypes.object,
  };

  componentDidUpdate(prevProps) {
    if(this.context.swipeableViews !== undefined)
      this.context.swipeableViews.slideUpdateHeight();
    if(prevProps.queryExecuted === false && this.props.queryExecuted === true)
      this.props.onRowClick(
        this.props.data.length ?
          this.props.data.slice().sort(this.getSorting(this.state.order, this.state.orderBy))[0].id : ''
      )();
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
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  render() {
    const { classes, cols, onRowClick, toolbar, data, selected } = this.props;
    const { order, orderBy, rowsPerPage, page } = this.state;

    return (
      <Paper className={classes.root}>
        { toolbar === undefined ? null : toolbar }
        <div className={classes.tableWrapper}>
          <Table className={classes.table} aria-labelledby="tableTitle">
            <REnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={this.handleRequestSort}
              cols={cols}
            />
            <TableBody>
              { data
                .sort(this.getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(n => {
                  return (
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={n.id}
                      onClick={onRowClick(n.id)}
                      role="radio"
                      aria-checked={selected == n.id}
                      selected={selected == n.id}
                    >
                      <TableCell padding="checkbox">
                        <Radio
                          checked={selected == n.id}
                        />
                      </TableCell>
                      {cols.map(col => (
                        <TableCell
                          className={classes.cell}
                          padding="dense"
                          component={col.key == 'name' ? 'th' : 'td'}
                          scope={col.key == 'name' ? 'row' : 'col'}
                          numeric={false}
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
          count={data.length}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 25, 50, 100]}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
          }}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Paper>
    );
  }
}

RadioTable.propTypes = {
  classes: PropTypes.object.isRequired,
  cols: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  onRowClick: PropTypes.func.isRequired,
  toolbar: PropTypes.object,
  selected: PropTypes.string,
  queryExecuted: PropTypes.bool.isRequired,
};

export default withStyles(styles)(RadioTable);
