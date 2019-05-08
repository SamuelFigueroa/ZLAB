import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import MenuItem from '@material-ui/core/MenuItem';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Popper from '@material-ui/core/Popper';
import MenuList from '@material-ui/core/MenuList';
import NoSsr from '@material-ui/core/NoSsr';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';

const styles = theme => ({
  paper: {
    overflow: 'auto',
    maxHeight: 150,
  },
  root: {
    zIndex: 1,
  },
  dropDown: {
    zIndex: 2,
    padding: '4px',
    color: theme.palette.text.secondary
  },
  searchIcon: {
    color: theme.palette.text.secondary
  },
  input: {
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit
  },
  textField: {
    borderColor: theme.palette.text.secondary,
    '&&&&:hover $outline': {
      borderColor: theme.palette.primary.main,
    }
  },
  searchTextField: {
    borderColor: theme.palette.text.secondary,
    '&&&&:hover $searchOutline': {
      borderColor: theme.palette.primary.main,
    }
  },
  outline:{ borderColor: theme.palette.text.secondary },
  searchOutline:{ borderColor: theme.palette.primary.main },
});

class TableSearchBar extends Component {
  constructor(props) {
    super(props);
    this.state={
      open: false,
      value: '',
      selectedCols: [],
      timeoutID: null
    };

    this.toggleColumnSelect = this.toggleColumnSelect.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.textField = React.createRef();
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { value, selectedCols, initialized } = this.props;
    if (prevProps.initialized === false && initialized === true)
      this.setState({ value, selectedCols });
  }

  toggleColumnSelect = () => this.setState({ open: !this.state.open });

  handleClose = () => this.setState({ open: false });

  handleChange = update => {
    this.setState(update, this.handleSubmit);
  }

  handleSubmit = () => {
    const { value, selectedCols, timeoutID } = this.state;
    if (timeoutID)
      clearTimeout(timeoutID);
    this.setState({ timeoutID: setTimeout(
      () => {
        this.props.onSubmit({ value, selectedCols });
        this.setState({ timeoutID: null });
      }, 300) });
  }

  render() {
    const { classes, cols, initialized } = this.props;
    const { open, value, selectedCols } = this.state;

    return (
      <NoSsr>
        <ClickAwayListener onClickAway={this.handleClose}>
          <div>
            <TextField
              name="search"
              variant="outlined"
              disabled={!initialized}
              label=""
              fullWidth
              autoComplete="off"
              onFocus={this.handleClose}
              ref={this.textField}
              inputProps={{
                'aria-owns': open ? 'menu-list-grow' : null,
                'aria-haspopup': 'true',
              }}
              value={value}
              onChange={e => this.handleChange({ value: e.target.value, selectedCols })}
              InputProps={{
                classes: {
                  input: classes.input,
                  root: value.length ? classes.searchTextField : classes.textField,
                  notchedOutline: value.length ? classes.searchOutline : classes.outline
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon className={classes.searchIcon} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Select Columns"
                      onClick={this.toggleColumnSelect}
                      className={classes.dropDown}
                    >
                      <ArrowDropDownIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <div className={classes.root} style={{ position: 'relative' }}>
              <Popper
                open={open}
                style={{ left: 0, right: 0, position: 'absolute' }}
                anchorEl={this.textField.anchorEl}
                transition
                disablePortal
                modifiers={{
                  preventOverflow: {
                    enabled: true,
                    boundariesElement: 'scrollParent'
                  }
                }}>
                {({ TransitionProps, placement }) => (
                  <Grow
                    {...TransitionProps}
                    id="menu-list-grow"
                    style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom'}}
                  >
                    <Paper
                      className={classes.paper}
                    >
                      <MenuList dense>
                        {
                          <MenuItem key="_all" id="_all" onClick={() => this.handleChange(
                            {
                              value,
                              selectedCols: selectedCols.length === cols.length ? [] : cols.map(c => c.key),
                            }
                          )}>
                            <Checkbox
                              checked={selectedCols.length == cols.length}
                              tabIndex={-1}
                              disableRipple
                            />
                            All Columns
                          </MenuItem>
                        }
                        {  cols.map(
                          col =>
                            <MenuItem key={col.key} id={col.key} onClick={() => {
                              const selectedIndex = selectedCols.indexOf(col.key);
                              let newSelected = [];
                              if (selectedIndex === -1) {
                                newSelected = newSelected.concat(selectedCols, col.key);
                              } else if (selectedIndex === 0) {
                                newSelected = newSelected.concat(selectedCols.slice(1));
                              } else if (selectedIndex === selectedCols.length - 1) {
                                newSelected = newSelected.concat(selectedCols.slice(0, -1));
                              } else if (selectedIndex > 0) {
                                newSelected = newSelected.concat(
                                  selectedCols.slice(0, selectedIndex),
                                  selectedCols.slice(selectedIndex + 1),
                                );
                              }
                              return this.handleChange({ value, selectedCols: newSelected });
                            }}>
                              <Checkbox
                                checked={selectedCols.includes(col.key)}
                                tabIndex={-1}
                                disableRipple
                              />
                              {col.label}
                            </MenuItem>)
                        }
                      </MenuList>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </div>
          </div>
        </ClickAwayListener>
      </NoSsr>
    );
  }
}

TableSearchBar.propTypes = {
  classes: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialized: PropTypes.bool.isRequired,
  value: PropTypes.string.isRequired,
  selectedCols: PropTypes.array.isRequired,
  cols: PropTypes.array.isRequired
};

export default withStyles(styles, { withTheme: true })(TableSearchBar);
