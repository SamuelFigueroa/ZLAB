import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import NoSsr from '@material-ui/core/NoSsr';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Popper from '@material-ui/core/Popper';
import MenuList from '@material-ui/core/MenuList';

const styles = theme => ({
  paper: {
    overflow: 'auto',
    maxHeight: 200,
  },
  root: {
    zIndex: 1,
  }
});

class Autocomplete extends Component {
  constructor(props) {
    super(props);
    this.state={
      open: false
    };
    this.handleToggle = this.handleToggle.bind(this);
    this.handleClose = this.handleToggle.bind(this);
    this.textField = React.createRef();
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleToggle = () => {
    this.setState({ open: !this.state.open });
  };

  handleClose = event => {
    if (this.anchorEl.contains(event.target)) {
      return;
    }
    this.setState({ open: false });
  };

  handleSelect = event => {
    const { onChange, name } = this.props.textFieldProps;
    let e = { target: {name, value: event.target.id } };
    onChange(e);
    this.handleClose();
  }

  render() {
    const { classes, textFieldProps, options } = this.props;
    const { open } = this.state;

    return (
      <NoSsr>
        <TextField
          fullWidth
          ref={this.textField}
          inputProps={{
            'aria-owns': open ? 'menu-list-grow' : null,
            'aria-haspopup': 'true'
          }}
          onClick={this.handleToggle}
          {...textFieldProps}
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
                <Paper className={classes.paper}>
                  <ClickAwayListener onClickAway={this.handleClose}>
                    <MenuList>
                      {
                        options.filter(option => option.toLowerCase()
                          .includes(textFieldProps.value.toLowerCase()))
                          .map( match =>
                            <MenuItem key={match} id={match} onClick={this.handleSelect}>
                              {match}
                            </MenuItem>
                          )
                      }
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </div>
      </NoSsr>
    );
  }
}

Autocomplete.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  textFieldProps: PropTypes.object.isRequired,
  options: PropTypes.array.isRequired
};

export default withStyles(styles, { withTheme: true })(Autocomplete);
