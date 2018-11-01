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

const operations = [
  {value: 'R', label: 'Read'},
  {value: 'W', label: 'Write'},
];

const formats = [
  {value: 'A', label: 'ASCII'},
  {value: 'H', label: 'Hex'},
];

class RfidFieldEdit extends Component {
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

  handleFieldPropChange = e => this.props.onChange('fieldProps', { ...this.props.componentProps.fieldProps, [e.target.name]: e.target.value });

  render() {
    const { errors } = this.state;
    const { classes, variables, componentProps } = this.props;
    const { name, kind, variable, data, fieldProps } = componentProps;
    const { operation, format } = fieldProps;

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
                      value={ name == data ? (operation == 'R' ? '<Read Label>' : '<Input>') : data }
                      margin="none"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Select
                      disabled={operation == 'R'}
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
              />
            )
          }
          {
            variable ? (
              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  name="operation"
                  label="Operation"
                  onChange={
                    e => {
                      if(e.target.value == 'R') {
                        return this.props.onChange(undefined, { name, kind, variable, data: name, fieldProps: { operation: 'R', format }});
                      }
                      return this.handleFieldPropChange(e);
                    }
                  }
                  value={operation}
                  margin="normal"
                >
                  {operations.map(o => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            ) : (
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  disabled={true}
                  label="Operation"
                  value="Write"
                  margin="normal"
                />
              </Grid>
            )
          }
          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              name="format"
              label="Format"
              onChange={this.handleFieldPropChange}
              value={format}
              margin="normal"
            >
              {formats.map(f => (
                <MenuItem key={f.value} value={f.value}>
                  {f.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
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


RfidFieldEdit.propTypes = {
  classes: PropTypes.object.isRequired,
  saveField: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  variables: PropTypes.array.isRequired,
  componentProps: PropTypes.object.isRequired,
  cancelField: PropTypes.func.isRequired,
};

export default withStyles(styles)(RfidFieldEdit);
