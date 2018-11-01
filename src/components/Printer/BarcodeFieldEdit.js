import React, { Component, Fragment } from 'react';
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

const justifications = [
  {value: 0, label: 'Left'},
  {value: 1, label: 'Right'},
];

const barcodes = [
  {value: 'code39', label: 'Code 39'},
  {value: 'datamatrix', label: 'Datamatrix'},
];

const aspectRatios = [
  { label: 'Square', value: 1 },
  { label: 'Rectangular', value: 2 }
];

const interpretationPositions = [
  { label: 'Below', value: false},
  { label: 'Above', value: true }
];

const validateInput = e => {
  let value = e.target.value;
  if(e.target.type !== undefined && e.target.type == 'number') {
    if(e.target.name == 'barWidthRatio') {
      value = Math.round(parseFloat(e.target.value) * 10) / 10;
      value = (isNaN(value)) ? parseFloat(e.target.min) : value;
      value = value < parseFloat(e.target.min) ? parseFloat(e.target.min) : value;
      value = value > parseFloat(e.target.max) ? parseFloat(e.target.max) : value;
    }
    else {
      value = parseInt(e.target.value);
      value = (isNaN(value)) ? parseInt(e.target.min) : value;
      value = value < parseInt(e.target.min) ? parseInt(e.target.min) : value;
      value = value > parseInt(e.target.max) ? parseInt(e.target.max) : value;
    }
  }
  return value;
};

class BarcodeFieldEdit extends Component {
  constructor(props) {
    super(props);
    this.state ={
      autoSize: true,
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
    const { classes, variables, defaults, componentProps } = this.props;
    const { name, variable, data, fieldProps } = componentProps;
    const {
      originX, originY, justify, reverse,
      barcode, orientation, moduleWidth, barWidthRatio,
      height, checkDigit, interpretation, interpretationAbove,
      moduleHeight, columns, rows, aspectRatio
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
                label="Data"
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
              name="barcode"
              label="Barcode"
              onChange={this.handleFieldPropChange}
              value={barcode}
              margin="normal"
            >
              {barcodes.map(b => (
                <MenuItem key={b.value} value={b.value}>
                  {b.label}
                </MenuItem>
              ))}
            </TextField>
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
              select
              fullWidth
              name="orientation"
              label="Orientation"
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
              name="barWidthRatio"
              label="Wide-to-Narrow"
              fullWidth
              onChange={this.handleFieldPropChange}
              value={barWidthRatio}
              margin="normal"
              inputProps={{
                type: 'number',
                min: 2.0,
                max: 3.0,
                step: 0.1,
              }}
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              name="moduleWidth"
              label="Module Width"
              fullWidth
              onChange={this.handleFieldPropChange}
              value={moduleWidth}
              margin="normal"
              inputProps={{
                type: 'number',
                min: 1,
                max: 10,
                step: 1,
              }}
            />
          </Grid>
          {
            barcode == 'code39' ? (
              <Fragment>
                <Grid item xs={2}>
                  <TextField
                    name="height"
                    label="Barcode Height"
                    fullWidth
                    onChange={this.handleFieldPropChange}
                    value={height}
                    margin="normal"
                    inputProps={{
                      type: 'number',
                      min: 10,
                      max: 32000,
                      step: 1
                    }}
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
                        name="interpretation"
                        checked={interpretation}
                        onChange={e => {
                          const event = { target: { } };
                          event.target.name = 'interpretation';
                          event.target.value = e.target.checked;
                          return this.handleFieldPropChange(event);
                        }}
                      />
                    }
                    label={<Typography color="textSecondary">Show Value</Typography>}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    select
                    fullWidth
                    disabled={!interpretation}
                    name="interpretationAbove"
                    label="Position"
                    onChange={this.handleFieldPropChange}
                    value={interpretationAbove}
                    margin="normal"
                    SelectProps={{
                      renderValue: () => interpretationAbove ? 'Above' : 'Below'
                    }}
                  >
                    {interpretationPositions
                      .map(position => (
                        <MenuItem key={position.value} value={position.value}>
                          {position.label}
                        </MenuItem>
                      ))}
                  </TextField>
                </Grid>
                <Grid item xs={3}>
                  <FormControlLabel
                    classes={{
                      root: classes._switch
                    }}
                    labelPlacement="start"
                    control={
                      <Switch
                        name="checkDigit"
                        checked={checkDigit}
                        onChange={e => {
                          const event = { target: { } };
                          event.target.name = 'checkDigit';
                          event.target.value = e.target.checked;
                          return this.handleFieldPropChange(event);
                        }}
                      />
                    }
                    label={<Typography color="textSecondary">Check Digit</Typography>}
                  />
                </Grid>
              </Fragment>
            ) : null
          }
          {
            barcode == 'datamatrix' ? (
              <Fragment>
                <Grid item xs={2}>
                  <TextField
                    name="moduleHeight"
                    label="Module Height"
                    fullWidth
                    onChange={this.handleFieldPropChange}
                    value={moduleHeight}
                    margin="normal"
                    inputProps={{
                      type: 'number',
                      min: 1,
                      max: defaults.labelWidth * (defaults.dotsPerMm == 'A' ? 203.2 : 101.6),
                      step: 1,
                    }}
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
                        name="autoSize"
                        checked={this.state.autoSize}
                        onChange={e => {
                          const callback = checked => {
                            const value = checked ? 0 : 14;
                            return this.props.onChange('fieldProps', {
                              rows: value,
                              columns: value
                            });
                          };
                          const checked = e.target.checked;
                          return this.setState({autoSize: e.target.checked }, callback(checked));
                        }}
                      />
                    }
                    label={<Typography color="textSecondary">Auto Dim.</Typography>}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name="rows"
                    label="Rows"
                    fullWidth
                    disabled={this.state.autoSize}
                    onChange={
                      e => {
                        if(aspectRatio == 1) {
                          const value = validateInput(e);
                          return this.props.onChange('fieldProps', { rows: value, columns: value });
                        }
                        return this.handleFieldPropChange(e);
                      }
                    }
                    value={this.state.autoSize ? 'auto': rows}
                    margin="normal"
                    inputProps={{
                      type: this.state.autoSize ? 'text' : 'number',
                      min: this.state.autoSize ? undefined : 10,
                      max: this.state.autoSize ? undefined : 48,
                      step: this.state.autoSize ? undefined : 2,
                    }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name="columns"
                    label="Columns"
                    fullWidth
                    onChange={
                      e => {
                        if(aspectRatio == 1) {
                          const value = validateInput(e);
                          return this.props.onChange('fieldProps', { rows: value, columns: value });
                        }
                        return this.handleFieldPropChange(e);
                      }
                    }
                    disabled={this.state.autoSize}
                    value={this.state.autoSize ? 'auto': columns}
                    margin="normal"
                    inputProps={{
                      type: this.state.autoSize ? 'text' : 'number',
                      min: this.state.autoSize ? undefined : 10,
                      max: this.state.autoSize ? undefined : 48,
                      step: this.state.autoSize ? undefined : 2,
                    }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    select
                    fullWidth
                    name="aspectRatio"
                    label="Aspect Ratio"
                    onChange={
                      e => {
                        if(e.target.value == 1) {
                          const value = rows;
                          return this.props.onChange('fieldProps', { rows: value, columns: value, aspectRatio: 1 });
                        }
                        return this.handleFieldPropChange(e);
                      }
                    }
                    value={aspectRatio}
                    margin="normal"
                    SelectProps={{
                      renderValue: () => aspectRatio !== null ? aspectRatios.find(r=>r.value == aspectRatio).label : ''
                    }}
                  >
                    {aspectRatios.map(ratio => (
                      <MenuItem key={ratio.value} value={ratio.value}>
                        {ratio.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Fragment>
            ) : null
          }
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
              alignItems="flex-end"
              justify="flex-end"
              spacing={8}>
              <Grid item xs={6}>
                <input type="submit" id="save-button" className={classes.input}/>
                <label htmlFor="save-button">
                  <Button variant="contained" component="span" color="primary" fullWidth>
                    Save
                  </Button>
                </label>
              </Grid>
              <Grid item xs={6}>
                <Button variant="contained" color="secondary" fullWidth
                  onClick={
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


BarcodeFieldEdit.propTypes = {
  classes: PropTypes.object.isRequired,
  saveField: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  variables: PropTypes.array.isRequired,
  componentProps: PropTypes.object.isRequired,
  defaults: PropTypes.object.isRequired,
  cancelField: PropTypes.func.isRequired,
};

export default withStyles(styles)(BarcodeFieldEdit);
