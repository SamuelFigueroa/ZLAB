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
    };

    this.toggleCategorySelect = this.toggleCategorySelect.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.textField = React.createRef();
  }

  toggleCategorySelect = () => this.setState({ open: !this.state.open });

  handleClose = () => this.setState({ open: false });

  render() {
    const { classes, value, categories, selected, onChange } = this.props;
    const { open } =this.state;

    return (
      <NoSsr>
        <ClickAwayListener onClickAway={this.handleClose}>
          <div>
            <TextField
              name="search"
              variant="outlined"
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
              onChange={e => onChange('search', e.target.value)}
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
                      aria-label="Select Search Category"
                      onClick={this.toggleCategorySelect}
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
                          <MenuItem key="_all" id="_all" onClick={() => onChange('searchCategory', categories.map(c => c.id))}>
                            <Checkbox
                              checked={selected.length == categories.length}
                              tabIndex={-1}
                              disableRipple
                            />
                            All Categories
                          </MenuItem>
                        }
                        {  categories.map(
                          category =>
                            <MenuItem key={category.id} id={category.id} onClick={() => onChange('searchCategory', category.id)}>
                              <Checkbox
                                checked={selected.includes(category.id)}
                                tabIndex={-1}
                                disableRipple
                              />
                              {category.label}
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
  value: PropTypes.string.isRequired,
  selected: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};

export default withStyles(styles, { withTheme: true })(TableSearchBar);
