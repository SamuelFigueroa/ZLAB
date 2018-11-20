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
import FilterListIcon from '@material-ui/icons/FilterList';
import IconButton from '@material-ui/core/IconButton';
import Chip from '@material-ui/core/Chip';
import TableExport from './TableExport';
import FilterModal from './FilterModal';
import TableSearchBar from './TableSearchBar';

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

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  cols: PropTypes.array.isRequired,
};

class EnhancedTableToolbar extends Component {
  constructor(props) {
    super(props);
    this.openFilterModal = this.openFilterModal.bind(this);
  }

  openFilterModal = openFilter => () => openFilter();

  render() {
    const { title, subheading, actions } = this.props;
    const { filter, search, download } = actions;

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
          <Grid item>
            <Tooltip title="Filter">
              <IconButton style={{ padding: '4px' }} aria-label="Filter list" onClick={this.openFilterModal(filter.open)}>
                <FilterListIcon color={filter.on ? 'primary' : 'inherit'}/>
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <TableExport exportData={download} />
          </Grid>
          {
            subheading ? (
              <Grid item xs={4}>
                <Typography variant="headline" color="textSecondary">
                  {subheading}
                </Typography>
              </Grid>
            ): null
          }
        </Grid>
      </Toolbar>
    );
  }
}

EnhancedTableToolbar.propTypes = {
  title: PropTypes.string.isRequired,
  subheading: PropTypes.string,
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
  }
});

class EnhancedTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      order: 'asc',
      orderBy: this.props.cols.filter(c => c.exclude === undefined || !c.exclude)[0].id,
      page: 0,
      rowsPerPage: 25,
      filterModalOpen: false,
      filterOn: false,
      filterState: JSON.stringify(this.props.defaultFilter),
      filter: this.props.defaultFilter,
      searchCategories: this.props.cols.filter(c => c.exclude === undefined || !c.exclude).map(c => c.id),
      search: '',
      data: []
    };
    this.getSorting = this.getSorting.bind(this);
    this.handleRequestSort = this.handleRequestSort.bind(this);
    this.handleChangePage = this.handleChangePage.bind(this);
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);
    this.openFilter = this.openFilter.bind(this);
    this.closeFilter = this.closeFilter.bind(this);
    this.filterData = this.filterData.bind(this);
    this.resetFilters = this.resetFilters.bind(this);
    this.setFilterState = this.setFilterState.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.exportData = this.exportData.bind(this);
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
    let data = await this.props.data.query.execute(this.props.defaultFilter);
    this.setState({ data });
  }

  openFilter = () => this.setState({ filterModalOpen: true });

  closeFilter = () => this.setState({ filterModalOpen: false });

  filterData = async (filter, state) => {
    let data = await this.props.data.query.execute(filter);
    if (data) {
      this.props.data.clearErrors();
      return this.setState({ filter, filterState: state, filterOn: true, filterModalOpen: false, data });
    }
  };

  resetFilters = async state => {
    this.props.data.clearErrors();
    let data = await this.props.data.query.execute(this.props.defaultFilter);
    this.setState({ filter: this.props.defaultFilter, filterState: state, data, filterOn: false });
  };

  setFilterState = filterState => this.setState({ filterState });

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
  exportData = async (name, closeDialog) => {
    const { search, searchCategories, filter } = this.state;
    let fileURL = await this.props.exportData.mutate({ filter, search, searchCategories, name });
    if(fileURL) {
      closeDialog();
      window.open(fileURL);
    }
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  render() {
    const { classes, title, subheading, cols, withToolbar, onRowClick, filters, filterOptions } = this.props;
    const { order, orderBy, rowsPerPage, page, filterModalOpen, filterState, data, search, searchCategories } = this.state;
    const queryResults = data.slice();

    return (
      <Paper className={classes.root}>
        <FilterModal
          open={filterModalOpen}
          actions={{
            filterData: this.filterData,
            resetFilters: this.resetFilters,
            setFilter: this.setFilterState,
          }}
          options={filterOptions}
          errors={this.props.data.errors}
          filter={filterState}
          onClose={this.closeFilter}
          filterPanels={filters} />
        { withToolbar === false ? null :
          <EnhancedTableToolbar
            title={title}
            subheading={subheading}
            actions={{
              filter: { open: this.openFilter, on: this.state.filterOn },
              search: { value: search, categories: cols.filter(c => c.exclude === undefined || !c.exclude), selectedCategories: searchCategories, handleChange: this.handleSearch },
              download: { handleDownload: async (filename, closeDialog) => await this.exportData(filename, closeDialog), errors: this.props.exportData.errors, clearErrors: this.props.exportData.clearErrors}
            }}/>
        }
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
                .filter( result => !searchCategories.length ||
                  searchCategories.some( cat =>
                    result[cat].toLowerCase().indexOf(search.toLowerCase()) > -1)
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
                    >
                      {cols.map(col => (
                        <TableCell
                          padding="dense"
                          component={col.id == 'name' ? 'th' : 'td'}
                          scope={col.id == 'name' ? 'row' : 'col'}
                          numeric={col.numeric}
                          key={col.id}>
                          {n[col.id] == '' ? 'N/A' : (
                            Array.isArray(n[col.id]) ? (
                              Array.from(new Set(n[col.id])).map(tableData =>
                                <Chip className={classes.chip} key={tableData} label={tableData} />)
                            ) : n[col.id]
                          )}
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

EnhancedTable.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  cols: PropTypes.array.isRequired,
  data: PropTypes.object.isRequired,
  subheading: PropTypes.string,
  onRowClick: PropTypes.func.isRequired,
  withToolbar: PropTypes.bool,
  filters: PropTypes.array,
  filterOptions: PropTypes.func,
  defaultFilter: PropTypes.object.isRequired,
  exportData: PropTypes.object.isRequired
};

export default withStyles(styles)(EnhancedTable);
