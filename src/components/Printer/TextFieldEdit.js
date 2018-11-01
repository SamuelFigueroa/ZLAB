import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '../Select';

const styles = theme => ({
  fieldEdit: {
    width: '100%',
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  _switch: {
    marginRight: 0,
    marginLeft: 0
  },
  input: {
    display: 'none',
  },
  hex: {
    display: 'inline-grid'
  }
});

const rotationAngles = [
  {value: 'N', label: '0\xB0'},
  {value: 'R', label: '90\xB0'},
  {value: 'I', label: '180\xB0'},
  {value: 'B', label: '270\xB0'}
];

const directions = [
  {value: 'H', label: 'Horizontal'},
  {value: 'V', label: 'Vertical'},
  {value: 'R', label: 'Reverse'},
];

const justifications = [
  {value: 0, label: 'Left'},
  {value: 1, label: 'Right'},
];

const formatData = (data, clock, hex) => {
  let formattedData = data;
  if(clock) {
    const day = new RegExp(`${clock}d`, 'g');
    const month = new RegExp(`${clock}m`, 'g');
    const year = new RegExp(`${clock}y`, 'g');
    let date = new Date();
    formattedData = formattedData.replace(day, (date.getDate()).toString().padStart(2,0));
    formattedData = formattedData.replace(month, (date.getMonth() + 1).toString().padStart(2,0));
    formattedData = formattedData.replace(year, (date.getFullYear()).toString().slice(-2));
  }
  if(hex) {
    const utf16 = new RegExp(`${hex}[0-9a-f]{2}${hex}[0-9a-f]{2}`, 'gi');
    const h = new RegExp(`${hex}`, 'g');
    formattedData = formattedData.replace(utf16, match => {
      const hexString = match.replace(h, '');
      const charCode = parseInt(hexString, 16);
      return String.fromCharCode(charCode);
    });
  }
  return formattedData;
};

const validateInput = e => {
  let value = e.target.value;
  if(e.target.type !== undefined && e.target.type == 'number') {
    value = parseInt(e.target.value);
    value = (isNaN(value)) ? parseInt(e.target.min) : value;
    value = value < parseInt(e.target.min) ? parseInt(e.target.min) : value;
    value = value > parseInt(e.target.max) ? parseInt(e.target.max) : value;
  }
  return value;
};

class TextFieldEdit extends Component {
  constructor(props){
    super(props);
    this.state={
      errors: {
        data: ''
      }
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleFieldPropChange = this.handleFieldPropChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit = e => {
    e.preventDefault();
    const errors = {};
    const { variable, data } = this.props.componentProps;
    if (!variable && data == '') {
      errors.data = 'Field data is required.';
      return this.setState({ errors });
    }
    return this.setState({ errors: { data: '' } }, this.props.saveField);
  }

  handleChange = e => this.props.onChange(e.target.name, e.target.value);

  handleFieldPropChange = e => this.props.onChange('fieldProps', { ...this.props.componentProps.fieldProps, [e.target.name]: validateInput(e) });

  render() {
    const { errors } = this.state;
    const { classes, variables, componentProps } = this.props;
    const { name, variable, data, fieldProps } = componentProps;
    const {
      originX, originY, justify, reverse,
      orientation, fontHeight, fontWidth,
      direction, gap,
      clockEnabled, clock, hexEnabled, hexIndicator,
    } = fieldProps;

    return (
      <form className={classes.container}
        onSubmit={this.handleSubmit}
        noValidate
        autoComplete="off">
        <Grid
          container
          alignItems="flex-end"
          justify="flex-start"
          spacing={8}
        >
          {
            variable ? (
              <Grid item xs={12}>
                <Grid container spacing={8}>
                  <Grid item xs={4}>
                    <TextField
                      label="Name"
                      fullWidth
                      disabled
                      value={name}
                      margin="none"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Data"
                      fullWidth
                      disabled
                      value={name == data ? '<Input>' : data}
                      margin="none"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Select
                      options={variables}
                      label="Set this field's data equal to..."
                      value={data}
                      onChange={e => {
                        const event = { target: { } };
                        event.target.name = 'data';
                        event.target.value = e.value;
                        return this.handleChange(event);
                      }}
                      isMulti={false} />
                  </Grid>
                </Grid>
              </Grid>
            ) : (
              <TextField
                name="data"
                label="Text"
                fullWidth
                onChange={this.handleChange}
                value={data}
                margin="none"
                error={Boolean(errors.data)}
                helperText={errors.data}
              />
            )
          }
          <Grid item xs={3}>
            <Typography variant="caption">
              Field Origin
            </Typography>
            <Grid
              container
              alignItems="flex-end"
              justify="flex-start"
              spacing={8}
            >
              <Grid item>
                <TextField
                  style={{ marginBottom: '8px'}}
                  name="originX"
                  placeholder="X"
                  onChange={this.handleFieldPropChange}
                  value={originX}
                  margin="none"
                  inputProps={{
                    type: 'number',
                    min: 0,
                    max: 32000,
                    step: 1,
                  }}
                />
              </Grid>
              <Grid item>
                <TextField
                  style={{ marginBottom: '8px'}}
                  name="originY"
                  placeholder="Y"
                  onChange={this.handleFieldPropChange}
                  value={originY}
                  margin="none"
                  inputProps={{
                    type: 'number',
                    min: 0,
                    max: 32000,
                    step: 1
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={2}>
            <TextField
              select
              fullWidth
              name="justify"
              label="Justify"
              onChange={this.handleFieldPropChange}
              value={justify}
              margin="normal"
              SelectProps={{
                renderValue: () => justify !== null ? justifications.find(j=>j.value==justify).label : ''
              }}
            >
              {justifications.map(justification => (
                <MenuItem key={justification.value} value={justification.value}>
                  {justification.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={2}>
            <TextField
              name="fontHeight"
              label="Height"
              fullWidth
              onChange={this.handleFieldPropChange}
              value={fontHeight}
              margin="normal"
              inputProps={{
                type: 'number',
                min: 10,
                max: 32000,
                step: 1,
              }}
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              name="fontWidth"
              label="Width"
              fullWidth
              onChange={this.handleFieldPropChange}
              value={fontWidth}
              margin="normal"
              inputProps={{
                type: 'number',
                min: 10,
                max: 32000,
                step: 1,
              }}
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              name="gap"
              label="Gap"
              fullWidth
              onChange={this.handleFieldPropChange}
              value={gap}
              margin="normal"
              inputProps={{
                type: 'number',
                min: 0,
                max: 9999,
                step: 1
              }}
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              select
              fullWidth
              name="orientation"
              label="Rotation"
              onChange={this.handleFieldPropChange}
              value={orientation}
              margin="normal"
            >
              {rotationAngles.map(angle => (
                <MenuItem key={angle.value} value={angle.value}>
                  {angle.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={2}>
            <TextField
              select
              fullWidth
              name="direction"
              label="Direction"
              onChange={this.handleFieldPropChange}
              value={direction}
              margin="normal"
              SelectProps={{
                renderValue: () => direction
              }}
            >
              {directions.map(direction => (
                <MenuItem key={direction.value} value={direction.value}>
                  {direction.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={3}>
            <FormControlLabel
              classes={{
                root: classes._switch
              }}
              labelPlacement="end"
              control={
                <Switch
                  name="clockEnabled"
                  checked={clockEnabled}
                  onChange={e => {
                    const event = { target: { } };
                    event.target.name = 'clockEnabled';
                    event.target.value = e.target.checked;
                    return this.handleFieldPropChange(event);
                  }}
                />
              }
              label={
                <div style={{ display: 'inline-grid'}}>
                  <TextField
                    name="clock"
                    label="Date Indicator"
                    disabled={!clockEnabled}
                    onChange={this.handleFieldPropChange}
                    value={clock}
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      maxLength: '1'
                    }}
                  />
                </div>
              }
            />
          </Grid>
          <Grid item xs={3}>
            <FormControlLabel
              classes={{
                root: classes._switch
              }}
              labelPlacement="end"
              control={
                <Switch
                  name="hexEnabled"
                  checked={hexEnabled}
                  onChange={e => {
                    const event = { target: { } };
                    event.target.name = 'hexEnabled';
                    event.target.value = e.target.checked;
                    return this.handleFieldPropChange(event);
                  }}
                />
              }
              label={
                <div style={{ display: 'inline-grid'}}>
                  <TextField
                    name="hexIndicator"
                    label="Hex Indicator"
                    disabled={!hexEnabled}
                    onChange={this.handleFieldPropChange}
                    value={hexIndicator}
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      maxLength: '1',
                    }}
                  />
                </div>
              }
            />
          </Grid>
          <Grid item xs={3}>
            <FormControlLabel
              classes={{
                root: classes._switch
              }}
              labelPlacement="start"
              control={
                <Switch
                  name="reverse"
                  checked={reverse}
                  onChange={e => {
                    const event = { target: { } };
                    event.target.name = 'reverse';
                    event.target.value = e.target.checked;
                    return this.handleFieldPropChange(event);
                  }}
                />
              }
              label={<Typography color="textSecondary">Reverse</Typography>}
            />
          </Grid>
          <Grid item xs={9}>
            <Grid
              container
              alignItems='flex-end'
              justify="flex-end"
              spacing={8}>
              <Grid item xs={3}>
                <input type="submit" id="save-button" className={classes.input}/>
                <label htmlFor="save-button">
                  <Button variant="contained"  component="span" color="primary" fullWidth>
                    Save
                  </Button>
                </label>
              </Grid>
              <Grid item xs={3}>
                <Button variant="contained" color="secondary" fullWidth onClick={
                  () => this.setState({ errors: { data: '' } }, this.props.cancelField)
                }>
                Cancel
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>
    );
  }
}


TextFieldEdit.propTypes = {
  classes: PropTypes.object.isRequired,
  saveField: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  variables: PropTypes.array.isRequired,
  componentProps: PropTypes.object.isRequired,
  cancelField: PropTypes.func.isRequired,
};

export default withStyles(styles)(TextFieldEdit);
