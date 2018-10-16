/* eslint-disable react/prop-types, react/jsx-handler-names */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Select from 'react-select';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import NoSsr from '@material-ui/core/NoSsr';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import CancelIcon from '@material-ui/icons/Cancel';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import Checkbox from '@material-ui/core/Checkbox';

const styles = theme => ({
  root: {
    flexGrow: 1,
    // height: 250,
  },
  input: {
    display: 'flex',
    padding: 0,
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
  },
  // chip: {
  //   margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`,
  // },
  // chipFocused: {
  //   backgroundColor: emphasize(
  //     theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
  //     0.08,
  //   ),
  // },
  noOptionsMessage: {
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  singleValue: {
    fontSize: 16,
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    fontSize: 16,
  },
  paper: {
    position: 'absolute',
    marginTop: theme.spacing.unit,
    zIndex: 20,
    left: 0,
    right: 0,
    overflow: 'auto',
    maxHeight: 200,
  },
  divider: {
    height: theme.spacing.unit * 2,
  },
  multiValue: {
    fontSize: 16,
    position: 'absolute',
    right: 0
  }
});

function NoOptionsMessage(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.noOptionsMessage}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function inputComponent({ inputRef, ...props }) {
  return <div ref={inputRef} {...props} />;
}

function Control(props) {
  return (
    <TextField
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          className: props.selectProps.classes.input,
          inputRef: props.innerRef,
          children: props.children,
          ...props.innerProps,
        },
      }}
      {...props.selectProps.textFieldProps}
    />
  );
}

function Option(props) {
  return (
    <MenuItem
      buttonRef={props.innerRef}
      component="div"
      style={{
        fontWeight: props.isSelected ? 500 : 400,
        paddingLeft: props.isMulti ? 0 : '16px',
        paddingRight: props.isMulti ? 0 : '16px'
      }}
      {...props.innerProps}
    >
      {
        props.isMulti ? (
          <Checkbox
            checked={props.isSelected}
            tabIndex={-1}
            disableRipple
          />
        ) : null
      }
      {props.children}
    </MenuItem>
  );
}

function Placeholder(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.placeholder}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function SingleValue(props) {
  return (
    <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
      {props.children}
    </Typography>
  );
}

function ValueContainer(props) {
  return (
    <div className={props.selectProps.classes.valueContainer} style={{ position: 'relative' }}>
      {props.children}
      {
        (props.isMulti && props.hasValue) && (
          <Typography color="primary" className={props.selectProps.classes.multiValue} {...props.innerProps}>
            {`${props.getValue().length} selected`}
          </Typography>
        )
      }
    </div>
  );
}

function MultiValue(props) {
  return null;

  // return (
  //   <Chip
  //     tabIndex={-1}
  //     label={props.children}
  //     className={classNames(props.selectProps.classes.chip, {
  //       [props.selectProps.classes.chipFocused]: props.isFocused,
  //     })}
  //     onDelete={props.removeProps.onClick}
  //     deleteIcon={<CancelIcon {...props.removeProps} />}
  //   />
  // );
}

function Menu(props) {
  return (
    <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
      {props.children}
    </Paper>
  );
}

const components = {
  Control,
  Menu,
  MultiValue,
  NoOptionsMessage,
  Option,
  Placeholder,
  SingleValue,
  ValueContainer
};

class IntegrationReactSelect extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes, theme, value, label, onChange, isMulti, options } = this.props;

    const selectStyles = {
      input: base => ({
        ...base,
        color: theme.palette.text.primary,
        '& input': {
          font: 'inherit',
        },
      }),
      dropdownIndicator: base => ({
        ...base,
        padding: '6px'
      }),
      clearIndicator: base => ({
        ...base,
        padding: '6px'
      }),
    };

    return (
      <div className={classes.root}>
        <NoSsr>
          <Select
            classes={classes}
            styles={selectStyles}
            textFieldProps={{
              label,
              InputLabelProps: {
                shrink: true,
              },
            }}
            options={options}
            components={components}
            value={value}
            onChange={onChange}
            placeholder=""
            isMulti={isMulti}
            backspaceRemovesValue={false}
            hideSelectedOptions={false}
            closeMenuOnSelect={!isMulti}
          />
        </NoSsr>
      </div>
    );
  }
}

IntegrationReactSelect.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(IntegrationReactSelect);
