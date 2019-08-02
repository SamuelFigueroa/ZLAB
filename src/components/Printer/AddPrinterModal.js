import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import AddPrinter from '../mutations/AddPrinter';


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
  addPrinterForm: {
    padding: theme.spacing.unit * 5,
  },
  addButton: {
    paddingTop: theme.spacing.unit * 2
  },
  input: {
    display: 'none',
  },
});

class AddPrinterModal extends Component {
  constructor(props) {
    super(props);
    this.state={
      name: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange = e => this.setState({ [e.target.name]: e.target.value });

  handleSubmit = addPrinter => async e => {
    e.preventDefault();
    const { name } = this.state;
    const { connection_name, onClose } = this.props;
    const response = await addPrinter({ name, connection_name });
    response !== undefined && await onClose();
  }


  render() {
    const { classes, open, onClose, connection_name } = this.props;
    return(
      <AddPrinter>
        { (addPrinter, errors) => (
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
                  <Typography variant="h4" align="center" gutterBottom>
                  New Printer Found!
                  </Typography>
                  <Typography align="center" variant="subtitle1">
                    <i>Connection: {connection_name}</i>
                  </Typography>
                  <Typography align="center" variant="body1" color="error">
                    {errors.connection_name !== undefined ? errors.connection_name : ''}
                  </Typography>
                </Grid>
                <Grid item>
                  <form className={classes.container}
                    onSubmit={this.handleSubmit(addPrinter)}
                    noValidate
                    autoComplete="off">
                    <Grid
                      container
                      direction="column"
                      spacing={8}>
                      <Grid item>
                        <TextField
                          name="name"
                          label="Please give it a name."
                          fullWidth
                          margin="normal"
                          value={this.state.name}
                          onChange={this.handleChange}
                          error={Boolean(errors.name)}
                          helperText={errors.name}
                        />
                      </Grid>
                      <Grid item className={classes.addButton}>
                        <input type="submit" id="add-button" className={classes.input}/>
                        <label htmlFor="add-button">
                          <Button variant="contained"  component="span" color="primary" fullWidth>
                          Add Printer
                          </Button>
                        </label>
                      </Grid>
                    </Grid>
                  </form>
                </Grid>
              </Grid>
            </div>
          </Modal>
        )}
      </AddPrinter>
    );
  }
}

AddPrinterModal.propTypes = {
  classes: PropTypes.object.isRequired,
  connection_name: PropTypes.string,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withStyles(styles)(AddPrinterModal);
