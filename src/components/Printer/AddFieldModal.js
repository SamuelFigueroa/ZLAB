import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MenuItem from '@material-ui/core/MenuItem';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3,
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    margin: 0
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  addFieldForm: {
    padding: theme.spacing.unit * 5,
  },
  addButton: {
    paddingTop: theme.spacing.unit * 2
  },
  input: {
    display: 'none',
  },
  _switch: {
    marginRight: 0,
    marginLeft: 0
  }
});

const fieldTypes = [
  {value: 'rfid', label: 'RFID'},
  {value: 'barcode', label: 'Barcode'},
  {value: 'text', label: 'Text'},
  {value: 'graphic', label: 'Graphics'}
];
class AddFieldModal extends Component {
  constructor(props) {
    super(props);
    this.state={
      name: '',
      variable: false,
      kind: 'barcode',
      errors: {
        name: ''
      }
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange = e => {
    if (e.target.name == 'kind' && e.target.value == 'graphic')
      return this.setState({ [e.target.name]: e.target.value, variable: false });
    return this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = e => {
    e.preventDefault();
    const {errors: err, ...field} = this.state;
    let errors = this.props.addField(field);
    if(errors)
      return this.setState({ errors });
    return this.setState({ name: '', variable: false, kind: 'barcode', errors: { name: '' } }, this.props.onClose);
  }


  render() {
    const { classes, open, onClose } = this.props;
    return(
      <Modal
        open={open}
        onClose={onClose}
      >
        <div className={classes.root}>
          <Grid
            container
            justify="center"
            alignItems="center"
            direction="column"
            spacing={8}>
            <Grid item>
              <Typography variant="display1" align="center" gutterBottom>
                  Create new field
              </Typography>
              <Grid item>
                <form className={classes.container}
                  onSubmit={this.handleSubmit}
                  noValidate
                  autoComplete="off">
                  <Grid
                    container
                    direction="column"
                    spacing={8}>
                    <Grid item>
                      <TextField
                        name="name"
                        label="Field Name"
                        fullWidth
                        margin="normal"
                        value={this.state.name}
                        onChange={this.handleChange}
                        error={Boolean(this.state.errors.name)}
                        helperText={this.state.errors.name}
                      />
                    </Grid>
                    <Grid item>
                      <TextField
                        select
                        fullWidth
                        name="kind"
                        label="Field Type"
                        onChange={this.handleChange}
                        value={this.state.kind}
                        margin="normal"
                      >
                        {fieldTypes.map(type => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    {
                      this.state.kind != 'graphic' ? (
                        <Grid item>
                          <FormControlLabel
                            classes={{
                              root: classes._switch
                            }}
                            labelPlacement="start"
                            control={
                              <Switch
                                name="variable"
                                checked={this.state.variable}
                                onChange={
                                  e => {
                                    const event = { target: { } };
                                    event.target.name = 'variable';
                                    event.target.value = e.target.checked;
                                    return this.handleChange(event);
                                  }
                                }
                              />
                            }
                            label={<Typography color="textSecondary">Variable</Typography>}
                          />
                        </Grid>
                      ) : null
                    }
                    <Grid item className={classes.addButton}>
                      <input type="submit" id="add-button" className={classes.input}/>
                      <label htmlFor="add-button">
                        <Button variant="contained"  component="span" color="primary" fullWidth>
                          Add Field
                        </Button>
                      </label>
                    </Grid>
                  </Grid>
                </form>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </Modal>
    );
  }
}

AddFieldModal.propTypes = {
  classes: PropTypes.object.isRequired,
  connection_name: PropTypes.string,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  addField: PropTypes.func.isRequired,
};

export default withStyles(styles)(AddFieldModal);
