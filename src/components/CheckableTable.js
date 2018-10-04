import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
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
import Checkbox from '@material-ui/core/Checkbox';
import { lighten } from '@material-ui/core/styles/colorManipulator';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import green from '@material-ui/core/colors/green';


class CEnhancedTableHead extends Component {
  constructor(props) {
    super(props);
    this.createSortHandler = this.createSortHandler.bind(this);
  }

  createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  };

  render() {
    const { cols, order, orderBy, onSelectAllClick, numSelected, rowCount, editMode } = this.props;

    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={numSelected === rowCount}
              onChange={onSelectAllClick}
              disabled={editMode}
            />
          </TableCell>
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

CEnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  cols: PropTypes.array.isRequired,
  numSelected: PropTypes.number.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  rowCount: PropTypes.number.isRequired,
  editMode: PropTypes.bool
};

const toolbarStyles = theme => ({
  root: {
    paddingRight: theme.spacing.unit,
    width: '80%'
  },
  highlight:
    theme.palette.type === 'light'
      ? {
        color: theme.palette.secondary.main,
        backgroundColor: lighten(theme.palette.secondary.light, 0.85),
      }
      : {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.secondary.dark,
      },
  title: {
    flex: '0 0 auto',
    zIndex: 1,
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  editMode: {
    color: green[500],
  },
});

let CEnhancedTableToolbar = props => {
  const { classes, title, subheading, numSelected, deleteAction, updateAction, editMode } = props;

  return (
    <div className={classNames({[classes.highlight]: numSelected > 0})}>
      <Toolbar
        className={classes.root}
      >
        { numSelected > 0 ? (
          <Grid container
            alignItems="center"
            className={classes.title}
            spacing={8}
          >
            <Grid item>
              <Typography variant="headline" color="inherit">
                {numSelected} selected
              </Typography>
            </Grid>
            <Grid item>
              <div className={classes.actions}>
                <Tooltip title="Delete">
                  <IconButton aria-label="Delete" disabled={editMode} onClick={deleteAction}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
                { updateAction ? (
                  <Tooltip title="Update">
                    <IconButton aria-label="Update" onClick={updateAction}>
                      <EditIcon className={classNames({[classes.editMode]: editMode })}/>
                    </IconButton>
                  </Tooltip>
                ) : null }
              </div>
            </Grid>
          </Grid>
        ) : (
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
        )}
      </Toolbar>
    </div>
  );
};

CEnhancedTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  subheading: PropTypes.string,
  numSelected: PropTypes.number.isRequired,
  deleteAction: PropTypes.func.isRequired,
  updateAction: PropTypes.func,
  editMode: PropTypes.bool.isRequired,
};

CEnhancedTableToolbar = withStyles(toolbarStyles)(CEnhancedTableToolbar);

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
  }
});

class CEnhancedTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      order: 'asc',
      orderBy: this.props.cols[0].id,
      selected: [],
      page: 0,
      rowsPerPage: 5,
    };
    this.getSorting = this.getSorting.bind(this);
    this.handleRequestSort = this.handleRequestSort.bind(this);
    this.handleChangePage = this.handleChangePage.bind(this);
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);
    this.handleSelectAllClick = this.handleSelectAllClick.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }
  static contextTypes = {
    swipeableViews: PropTypes.object.isRequired,
  };

  componentDidUpdate() {
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

  handleSelectAllClick = data => event => {
    if (event.target.checked) {
      this.setState({ selected: data.map(n => n.id) });
      return;
    }
    this.setState({ selected: [] });
  };

  handleSelect = id => {
    const { selected } = this.state;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    this.setState({ selected: newSelected });
  }

  handleClick = (onRowClick, id) => e => {
    if (e.target.checked !== undefined)
      return this.handleSelect(id);
    else {
      return onRowClick();
    }
  }

  isSelected = id => this.state.selected.indexOf(id) !== -1;

  render() {
    const { classes, title, subheading, cols, data, actions, editMode, editable } = this.props;
    const { order, orderBy, rowsPerPage, page, selected } = this.state;
    const queryResults = data.slice();
    // console.log(queryResults.sort(this.getSorting(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage));
    // const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

    return (
      <Paper className={classes.root}>
        <CEnhancedTableToolbar
          numSelected={selected.length}
          title={title}
          subheading={subheading}
          editMode={editMode}
          deleteAction={() => {
            this.setState({selected: []});
            return actions.delete(selected);
          }}
          updateAction={
            editable ? (
              selected.length == 1 ? (
                () => actions.update(selected[0])
              ) : null
            ) : null }
        />
        <div className={classes.tableWrapper}>
          <Table className={classes.table} aria-labelledby="tableTitle">
            <CEnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={this.handleSelectAllClick(queryResults)}
              rowCount={data.length}
              onRequestSort={this.handleRequestSort}
              cols={cols}
              editMode={editMode}
            />
            <TableBody>
              { queryResults
                .sort(this.getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(n => {
                  const isSelected = this.isSelected(n.id);
                  return (
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={n.id}
                      onClick={
                        this.props.onRowClick !== undefined ?
                          this.handleClick(this.props.onRowClick(n.id), n.id) :
                          editMode ? null : () => this.handleSelect(n.id)
                      }
                      role="checkbox"
                      aria-checked={isSelected}
                      selected={isSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          disabled={editMode}
                        />
                      </TableCell>
                      {cols.map(col => (
                        <TableCell
                          style={{ cursor: 'default' }}
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

CEnhancedTable.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  cols: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  subheading: PropTypes.string,
  onRowClick: PropTypes.func,
  actions: PropTypes.object.isRequired,
  editable: PropTypes.bool.isRequired,
  editMode: PropTypes.bool.isRequired
};

export default withStyles(styles)(CEnhancedTable);
