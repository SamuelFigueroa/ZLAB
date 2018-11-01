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

const styles = theme => ({
  fieldEdit: {
    width: '100%',
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  reverse: {
    marginRight: 0,
    marginLeft: 0
  },
  input: {
    display: 'none',
  },
  hex: {
    display: 'inline-grid'
  },
  caption: {
    marginTop: theme.spacing.unit * 2
  }
});

const rotationAngles = [
  {value: 'N', label: '0\xB0'},
  {value: 'R', label: '90\xB0'},
  {value: 'I', label: '180\xB0'},
  {value: 'B', label: '270\xB0'}
];

const orientations = [
  {value: 'N', label: 'Normal'},
  {value: 'I', label: 'Invert'},
];

const justifications = [
  {value: 0, label: 'Left'},
  {value: 1, label: 'Right'},
];

const printDensities = [
  {value: 'A', label: '8'},
  {value: 'B', label: '4'},
];

const validateInput = e => {
  let value = e.target.value;
  if(e.target.type !== undefined && e.target.type == 'number') {
    value = parseFloat(e.target.value);
    value = (isNaN(value)) ? parseFloat(e.target.min) : value;
    value = value < parseFloat(e.target.min) ? parseFloat(e.target.min) : value;
    value = value > parseFloat(e.target.max) ? parseFloat(e.target.max) : value;
  }
  return value;
};

class DefaultsEdit extends Component {
  constructor(props){
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange = e => this.props.onChange(e.target.name, validateInput(e));

  render() {
    const { classes, saveFormat, errors, cancelFormat, onPrinterChange, previewPrinter, previewOptions } = this.props;
    const {
      name,
      labelWidth, labelLength, labelOrientation,
      fieldOrientation, fieldJustify,
      dotsPerMm
    } = this.props.defaults;

    return (
      <form className={classes.container}
        onSubmit={saveFormat}
        noValidate
        autoComplete="off">
        <Grid
          container
          alignItems="flex-start"
          justify="flex-start"
          spacing={8}
        >
          <Grid item xs={4}>
            <TextField
              name="name"
              label="Format Name"
              fullWidth
              onChange={this.handleChange}
              value={name}
              error={Boolean(errors.name)}
              helperText={errors.name}
              margin="normal"
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              select
              fullWidth
              label="Printer"
              onChange={e=>onPrinterChange(e.target.value)}
              value={Object.keys(previewPrinter).length !== 0 ? previewPrinter.name : ''}
              margin="normal"
            >
              {previewOptions.map(option => (
                <MenuItem key={option.name} value={option.name}>
                  {option.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" className={classes.caption}>
              Label Dimensions W x L inches
            </Typography>
            <Grid
              container
              alignItems="flex-start"
              justify="flex-start"
              spacing={8}
            >
              <Grid item>
                <TextField
                  style={{ marginBottom: '8px'}}
                  name="labelWidth"
                  placeholder="W in."
                  onChange={this.handleChange}
                  value={labelWidth}
                  margin="none"
                  error={Boolean(errors.labelWidth)}
                  helperText={errors.labelWidth}
                  inputProps={{
                    type: 'number',
                    min: 0,
                    max: 100,
                    step: 0.0001,
                  }}
                />
              </Grid>
              <Grid item>
                <TextField
                  style={{ marginBottom: '8px'}}
                  name="labelLength"
                  placeholder="L in."
                  onChange={this.handleChange}
                  value={labelLength}
                  error={Boolean(errors.labelLength)}
                  helperText={errors.labelLength}
                  margin="none"
                  inputProps={{
                    type: 'number',
                    min: 0,
                    max: 100,
                    step: 0.0001,
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={3}>
            <TextField
              select
              fullWidth
              name="fieldOrientation"
              label="Field Rotation"
              onChange={this.handleChange}
              value={fieldOrientation}
              margin="normal"
            >
              {rotationAngles.map(angle => (
                <MenuItem key={angle.value} value={angle.value}>
                  {angle.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={3}>
            <TextField
              select
              fullWidth
              name="fieldJustify"
              label="Field Justify"
              onChange={this.handleChange}
              value={fieldJustify}
              margin="normal"
              SelectProps={{
                renderValue: () => fieldJustify !== null ? justifications.find(j=>j.value==fieldJustify).label : ''
              }}
            >
              {justifications.map(justification => (
                <MenuItem key={justification.value} value={justification.value}>
                  {justification.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={3}>
            <TextField
              select
              fullWidth
              name="labelOrientation"
              label="Label Orientation"
              onChange={this.handleChange}
              value={labelOrientation}
              margin="normal"
            >
              {orientations.map(orientation => (
                <MenuItem key={orientation.value} value={orientation.value}>
                  {orientation.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={3}>
            <TextField
              select
              fullWidth
              name="dotsPerMm"
              label="Dots per mm"
              onChange={this.handleChange}
              value={dotsPerMm}
              margin="normal"
            >
              {printDensities.map(density => (
                <MenuItem key={density.value} value={density.value}>
                  {density.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={3}>
            <FormControlLabel
              classes={{
                root: classes.reverse
              }}
              labelPlacement="start"
              control={
                <Switch
                  name="reverse"
                  onChange={e => {
                    const event = { target: { } };
                    event.target.name = 'reverse';
                    event.target.value = e.target.checked;
                    return this.handleChange(event);
                  }}
                />
              }
              label={<Typography color="textSecondary">Reverse</Typography>}
            />
          </Grid>
          <Grid item xs={3}>
            <FormControlLabel
              classes={{
                root: classes.reverse
              }}
              labelPlacement="start"
              control={
                <Switch
                  name="mirror"
                  onChange={e => {
                    const event = { target: { } };
                    event.target.name = 'mirror';
                    event.target.value = e.target.checked;
                    return this.handleChange(event);
                  }}
                />
              }
              label={<Typography color="textSecondary">Mirror</Typography>}
            />
          </Grid>
          <Grid item xs={6}>
            <Grid
              container
              alignItems='flex-end'
              justify="flex-end"
              spacing={8}>
              <Grid item xs={9}>
                <input type="submit" id="save-button" className={classes.input}/>
                <label htmlFor="save-button">
                  <Button variant="contained"  component="span" color="primary" fullWidth>
                    Save Format
                  </Button>
                </label>
              </Grid>
              <Grid item xs={3}>
                <Button variant="contained" color="secondary" onClick={cancelFormat} fullWidth>
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


DefaultsEdit.propTypes = {
  classes: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  defaults: PropTypes.object.isRequired,
  saveFormat: PropTypes.func.isRequired,
  cancelFormat: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  onPrinterChange: PropTypes.func.isRequired,
  previewPrinter: PropTypes.object.isRequired,
  previewOptions: PropTypes.array.isRequired,
};

export default withStyles(styles)(DefaultsEdit);
