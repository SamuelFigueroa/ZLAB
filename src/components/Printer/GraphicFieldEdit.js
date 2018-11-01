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

const graphics = [
  {value: 'line', label: 'Line'},
  {value: 'box', label: 'Box'},
  {value: 'circle', label: 'Circle'},
  {value: 'ellipse', label: 'Ellipse'},
  {value: 'upload', label: 'Upload'},
];

const colors = [
  {value: 'B', label: 'Black'},
  {value: 'W', label: 'White'}
];

const directions = [
  {value: 'H', label: 'Horizontal'},
  {value: 'V', label: 'Vertical'},
  {value: 'D', label: 'Diagonal'},
];

const diagonalDirections = [
  {value: 'R', label: 'Forward'},
  {value: 'L', label: 'Back'},
];

const justifications = [
  {value: 0, label: 'Left'},
  {value: 1, label: 'Right'},
];

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

class GraphicFieldEdit extends Component {
  constructor(props){
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleFieldPropChange = this.handleFieldPropChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit = e => {
    e.preventDefault();
    return this.props.saveField();
  }

  handleChange = e => this.props.onChange(e.target.name, e.target.value);

  handleFieldPropChange = e => this.props.onChange('fieldProps', { ...this.props.componentProps.fieldProps, [e.target.name]: validateInput(e) });

  render() {
    const { classes, componentProps } = this.props;
    const { fieldProps } = componentProps;
    const {
      originX, originY, justify, reverse,
      graphic, color, thickness, //All shapes
      width, height, //box, line, diag, ellipse
      roundness, //box
      diameter,  //circle
      diagonalOrientation, //diag
      compression, byteCount, fieldCount, bytesPerRow, graphicData
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
              select
              fullWidth
              name="graphic"
              label="Graphic"
              onChange={
                e => {
                  if (e.target.value == 'line') {
                    return this.props.onChange('fieldProps', { graphic: 'box', height: 0, width: 1 });
                  }
                  return this.props.onChange('fieldProps', { graphic: e.target.value, height: 1, width: 1 });
                }
              }
              value={graphic}
              SelectProps={{
                renderValue: () => ((graphic == 'box' && (width == 0 || height == 0)) || graphic == 'diagonal') ?
                  'Line' : graphics.find(g=>g.value==graphic).label
              }}
              margin="normal"
            >
              {
                graphics.map(g => (
                  <MenuItem key={g.value} value={g.value}>
                    {g.label}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
          <Grid item xs={2}>
            <TextField
              select
              fullWidth
              name="color"
              label="Color"
              onChange={this.handleFieldPropChange}
              value={color}
              margin="normal"
            >
              {colors.map(c => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={2}>
            <TextField
              name="thickness"
              label="Thickness"
              fullWidth
              onChange={this.handleFieldPropChange}
              value={thickness}
              margin="normal"
              inputProps={{
                type: 'number',
                min: 1,
                max: (graphic == 'circle' || graphic == 'ellipse') ? 4095 : 32000,
                step: 1,
              }}
            />
          </Grid>
          {
            graphic == 'circle' ? (
              <Grid item xs={2}>
                <TextField
                  name="diameter"
                  label="Diameter"
                  fullWidth
                  onChange={this.handleFieldPropChange}
                  value={diameter}
                  margin="normal"
                  inputProps={{
                    type: 'number',
                    min: 3,
                    max: 4095,
                    step: 1,
                  }}
                />
              </Grid>
            ) :  null
          }
          {
            graphic == 'ellipse' ? (
              <Fragment>
                <Grid item xs={2}>
                  <TextField
                    name="width"
                    label="Width"
                    fullWidth
                    onChange={this.handleFieldPropChange}
                    value={width}
                    margin="normal"
                    inputProps={{
                      type: 'number',
                      min: 1,
                      max: 4095,
                      step: 1,
                    }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name="height"
                    label="Height"
                    fullWidth
                    onChange={this.handleFieldPropChange}
                    value={height}
                    margin="normal"
                    inputProps={{
                      type: 'number',
                      min: 1,
                      max: 4095,
                      step: 1,
                    }}
                  />
                </Grid>
              </Fragment>
            ) : null
          }
          {
            (graphic == 'box' && (width == 0 || height == 0)) || graphic =='diagonal' ? (
              <Grid item xs={2}>
                <TextField
                  select
                  fullWidth
                  name="direction"
                  label="Direction"
                  onChange={
                    e => {
                      if (e.target.value == 'H') {
                        return this.props.onChange('fieldProps', { graphic: 'box', height: 0, width: 1 });
                      }
                      if (e.target.value == 'V') {
                        return this.props.onChange('fieldProps', { graphic: 'box', width: 0, height: 1 });
                      }
                      return this.props.onChange('fieldProps', { graphic: 'diagonal', width: 3, height: 3 });
                    }
                  }
                  value={
                    graphic == 'box' ? (
                      height == 0 ? 'H' : 'V'
                    ) : 'D'
                  }
                  margin="normal"
                >
                  {directions.map(d => (
                    <MenuItem key={d.value} value={d.value}>
                      {d.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            ) : null
          }
          {
            graphic == 'box' ? (
              <Fragment>
                <Grid item xs={2}>
                  <TextField
                    name="width"
                    label="Width"
                    disabled={width == 0}
                    fullWidth
                    onChange={this.handleFieldPropChange}
                    value={width}
                    margin="normal"
                    inputProps={{
                      type: 'number',
                      min: 1,
                      max: 32000,
                      step: 1,
                    }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name="height"
                    label="Height"
                    disabled={height == 0}
                    fullWidth
                    onChange={this.handleFieldPropChange}
                    value={height}
                    margin="normal"
                    inputProps={{
                      type: 'number',
                      min: 1,
                      max: 32000,
                      step: 1,
                    }}
                  />
                </Grid>
                {
                  ( width > 0 && height > 0 ) ? (
                    <Grid item xs={2}>
                      <TextField
                        name="roundness"
                        label="Roundness"
                        fullWidth
                        onChange={this.handleFieldPropChange}
                        value={roundness}
                        margin="normal"
                        inputProps={{
                          type: 'number',
                          min: 0,
                          max: 8,
                          step: 1
                        }}
                      />
                    </Grid>
                  ) : null
                }
              </Fragment>
            ) : null
          }
          {
            graphic == 'diagonal' ? (
              <Fragment>
                <Grid item xs={2}>
                  <TextField
                    name="width"
                    label="Width"
                    fullWidth
                    onChange={this.handleFieldPropChange}
                    value={width}
                    margin="normal"
                    inputProps={{
                      type: 'number',
                      min: 3,
                      max: 32000,
                      step: 1,
                    }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    name="height"
                    label="Height"
                    fullWidth
                    onChange={this.handleFieldPropChange}
                    value={height}
                    margin="normal"
                    inputProps={{
                      type: 'number',
                      min: 3,
                      max: 32000,
                      step: 1,
                    }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    select
                    fullWidth
                    name="diagonalOrientation"
                    label="Orientation"
                    onChange={this.handleFieldPropChange}
                    value={diagonalOrientation}
                    margin="normal"
                  >
                    {diagonalDirections.map(d => (
                      <MenuItem key={d.value} value={d.value}>
                        {d.label}
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
              alignItems='flex-end'
              justify="flex-end"
              spacing={8}>
              <Grid item xs={6}>
                <input type="submit" id="save-button" className={classes.input}/>
                <label htmlFor="save-button">
                  <Button variant="contained"  component="span" color="primary" fullWidth>
                    Save
                  </Button>
                </label>
              </Grid>
              <Grid item xs={6}>
                <Button variant="contained" color="secondary" onClick={this.props.cancelField} fullWidth>
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


GraphicFieldEdit.propTypes = {
  classes: PropTypes.object.isRequired,
  saveField: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  variables: PropTypes.array.isRequired,
  componentProps: PropTypes.object.isRequired,
  cancelField: PropTypes.func.isRequired,
};

export default withStyles(styles)(GraphicFieldEdit);
