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
import IconButton from '@material-ui/core/IconButton';
import TableSearchBar from './TableSearchBar';
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
                key={col.id}
                numeric={col.numeric}
                sortDirection={orderBy === col.id ? order : false}
              >
                { col.exclude === undefined || !col.exclude ? (
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

class REnhancedTableToolbar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { title, rightHeader, actions } = this.props;
    const { search } = actions;

    return (
      <Toolbar>
        <Grid container
          alignItems="center"
          justify="flex-start"
          spacing={16}
        >
          <Grid item>
            <Typography variant="headline" color="primary" id="tableTitle">
              {title}
            </Typography>
          </Grid>
          <Grid item sm={4} xs={6}>
            <TableSearchBar value={search.value} selected={search.selectedCategories} categories={search.categories} onChange={search.handleChange} />
          </Grid>
          { rightHeader ? rightHeader: null }
        </Grid>
      </Toolbar>
    );
  }
}

REnhancedTableToolbar.propTypes = {
  title: PropTypes.string.isRequired,
  rightHeader: PropTypes.object,
  actions: PropTypes.object.isRequired
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
      orderBy: this.props.cols.filter(c => c.exclude === undefined || !c.exclude)[0].id,
      page: 0,
      rowsPerPage: 25,
      searchCategories: this.props.cols.filter(c => c.exclude === undefined || !c.exclude).map(c => c.id),
      search: '',
      data: [],
    };
    this.getSorting = this.getSorting.bind(this);
    this.handleRequestSort = this.handleRequestSort.bind(this);
    this.handleChangePage = this.handleChangePage.bind(this);
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }
  static contextTypes = {
    swipeableViews: PropTypes.object,
  };

  componentDidUpdate() {
    if(this.context.swipeableViews !== undefined)
      this.context.swipeableViews.slideUpdateHeight();
  }

  async componentDidMount() {
    if(this.context.swipeableViews !== undefined)
      this.context.swipeableViews.slideUpdateHeight();
    let data = await this.props.data.query.execute();
    this.setState({ data },
      this.props.onRowClick(
        data.length ?
          data.slice().sort(this.getSorting(this.state.order, this.state.orderBy))[0].id : ''
      )
    );
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

  handleSearch = (name, value) => {
    if (name == 'search')
      return this.setState({ search: value });
    if (Array.isArray(value))
      return this.setState({ searchCategories: this.state.searchCategories.length == value.length ? [] : value });
    const { searchCategories } = this.state;
    const selectedIndex = searchCategories.indexOf(value);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(searchCategories, value);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(searchCategories.slice(1));
    } else if (selectedIndex === searchCategories.length - 1) {
      newSelected = newSelected.concat(searchCategories.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        searchCategories.slice(0, selectedIndex),
        searchCategories.slice(selectedIndex + 1),
      );
    }

    return this.setState({ searchCategories: newSelected });
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  render() {
    const { classes, title, rightHeader, cols, onRowClick, selected } = this.props;
    const { order, orderBy, rowsPerPage, page, data, search, searchCategories } = this.state;
    const queryResults = data.slice();

    return (
      <Paper className={classes.root}>
        <REnhancedTableToolbar
          title={title}
          rightHeader={rightHeader}
          actions={{
            search: { value: search, categories: cols.filter(c => c.exclude === undefined || !c.exclude), selectedCategories: searchCategories, handleChange: this.handleSearch },
          }}/>
        <div className={classes.tableWrapper}>
          <Table className={classes.table} aria-labelledby="tableTitle">
            <REnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={this.handleRequestSort}
              cols={cols}
            />
            <TableBody>
              { queryResults
                .filter( result => !searchCategories.length ||
                  searchCategories.some( cat => {
                    const data = result[cat].toLowerCase !== undefined ? result[cat].toLowerCase() : result[cat].props.label.toLowerCase();
                    return data.indexOf(search.toLowerCase()) > -1;
                  })
                )
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
  title: PropTypes.string.isRequired,
  cols: PropTypes.array.isRequired,
  data: PropTypes.object.isRequired,
  rightHeader: PropTypes.object,
  onRowClick: PropTypes.func.isRequired,
};

export default withStyles(styles)(RadioTable);
