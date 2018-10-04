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
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';

// import Button from '@material-ui/core/Button';

class EnhancedTableHead extends Component {
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
                key={col.id}
                numeric={col.numeric}
                sortDirection={orderBy === col.id ? order : false}
              >
                <Tooltip
                  title="Sort"
                  placement={col.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={orderBy === col.id}
                    direction={order}
                    onClick={this.createSortHandler(col.id)}
                  >
                    {col.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            );
          }, this)}
        </TableRow>
      </TableHead>
    );
  }
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  cols: PropTypes.array.isRequired,
};

const toolbarStyles = theme => ({
  root: {
    paddingRight: theme.spacing.unit,
    width: '80%'
  },
  title: {
    flex: '0 0 auto',
    zIndex: 1,
  },
});

let EnhancedTableToolbar = props => {
  const { classes, title, subheading } = props;

  return (
    <Toolbar
      className={classes.root}
    >
      <Grid container
        alignItems="center"
        justify="space-between"
        className={classes.title}
      >
        <Grid item>
          <Typography variant="headline" color="primary" id="tableTitle">
            {title}
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="headline" color="textSecondary">
            {subheading}
          </Typography>
        </Grid>
      </Grid>
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  subheading: PropTypes.string,
};

EnhancedTableToolbar = withStyles(toolbarStyles)(EnhancedTableToolbar);

const styles = theme => ({
  root: {
    // width: '100%',
    marginTop: theme.spacing.unit * 3,
  },
  table: {
    // minWidth: 1020,
  },
  tableWrapper: {
    // overflowX: 'auto',
  },
});

class EnhancedTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      order: 'asc',
      orderBy: this.props.cols[0].id,
      page: 0,
      rowsPerPage: 5,
    };
    this.getSorting = this.getSorting.bind(this);
    this.handleRequestSort = this.handleRequestSort.bind(this);
    this.handleChangePage = this.handleChangePage.bind(this);
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);
  }
  static contextTypes = {
    swipeableViews: PropTypes.object.isRequired,
  };

  componentDidUpdate() {
    this.context.swipeableViews.slideUpdateHeight();
  }

  componentDidMount() {
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
    const { classes, title, subheading, cols, data, withToolbar, onRowClick } = this.props;
    const { order, orderBy, rowsPerPage, page } = this.state;
    const queryResults = data.slice();
    // console.log(queryResults.sort(this.getSorting(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage));
    // const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

    return (
      <Paper className={classes.root}>
        { withToolbar === false ? null : <EnhancedTableToolbar title={title} subheading={subheading}/> }
        <div className={classes.tableWrapper}>
          <Table className={classes.table} aria-labelledby="tableTitle">
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={this.handleRequestSort}
              cols={cols}
            />
            <TableBody>
              { queryResults
                .sort(this.getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
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
                          padding="dense"
                          component={col.id == 'name' ? 'th' : 'td'}
                          scope={col.id == 'name' ? 'row' : 'col'}
                          numeric={col.numeric}
                          key={col.id}>
                          {n[col.id] == '' ? 'N/A' : n[col.id]}
                        </TableCell>
                      )
                      )}
                    </TableRow>
                  );
                })}
              {/*emptyRows > 0 && (
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )*/}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
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

EnhancedTable.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  cols: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  subheading: PropTypes.string,
  onRowClick: PropTypes.func.isRequired,
  withToolbar: PropTypes.bool
};

export default withStyles(styles)(EnhancedTable);
