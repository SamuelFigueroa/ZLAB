import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import MenuItem from '@material-ui/core/MenuItem';
import GetPrinterFormats from '../queries/GetPrinterFormats';
import GetPrinters from '../queries/GetPrinters';
import QuickPrint from '../mutations/QuickPrint';

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
  printButton: {
    marginTop: theme.spacing.unit * 2
  },
  input: {
    display: 'none',
  },
});

class QuickPrintModal extends Component {
  constructor(props) {
    super(props);
    this.state={
      printer: '',
      formatID: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleClose = clearErrors => () => {
    clearErrors();
    this.props.onClose();
  }

  handleChange = e => this.setState({ [e.target.name]: e.target.value });

  handleSubmit = quickPrint => async e => {
    e.preventDefault();
    const { printer, formatID } = this.state;
    const { data } = this.props;
    let response = await quickPrint({ printer, formatID, data });
    let success = response !== undefined;
    if(success)
      this.handleClose();
  }


  render() {
    const { classes, open } = this.props;
    return(
      <QuickPrint>
        { (quickPrint, errors, clearErrors) => (
          <GetPrinters>
            { printers => (
              <GetPrinterFormats withFields={false}>
                { printerFormats => (
                  <Modal
                    open={open}
                    onClose={this.handleClose(clearErrors)}
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
                              Print
                          </Typography>
                          <Grid item>
                            <form className={classes.container}
                              onSubmit={this.handleSubmit(quickPrint)}
                              noValidate
                              autoComplete="off">
                              <Grid
                                container
                                direction="column"
                                spacing={8}>
                                <Grid item>
                                  <TextField
                                    label="Data"
                                    disabled={true}
                                    fullWidth
                                    margin="normal"
                                    value={this.props.data}
                                  />
                                </Grid>
                                <Grid item>
                                  {
                                    printers ?
                                      <TextField
                                        name="printer"
                                        label="Select Printer"
                                        fullWidth
                                        select
                                        value={this.state.printer}
                                        onChange={this.handleChange}
                                        margin="none"
                                        error={Boolean(errors.printer)}
                                        helperText={errors.printer}
                                      >
                                        {
                                          printers.map(p => (
                                            <MenuItem key={p.name} value={p.name}>
                                              {p.name}
                                            </MenuItem>
                                          ))
                                        }
                                      </TextField>
                                      : null
                                  }
                                </Grid>
                                <Grid item>
                                  {
                                    printerFormats ?
                                      <TextField
                                        name="formatID"
                                        label="Select Format"
                                        fullWidth
                                        select
                                        value={this.state.formatID}
                                        onChange={this.handleChange}
                                        error={Boolean(errors.formatID)}
                                        helperText={errors.formatID}
                                        margin="none"
                                        SelectProps={{
                                          renderValue: () => this.state.formatID.length ? printerFormats.find(f=>f.id==this.state.formatID).name : ''
                                        }}
                                      >
                                        {
                                          printerFormats.map(f => (
                                            <MenuItem key={f.id} value={f.id}>
                                              {f.name}
                                            </MenuItem>
                                          ))
                                        }
                                      </TextField>
                                      : null
                                  }
                                </Grid>
                                <Grid item>
                                  <input type="submit" id="print-button" className={classes.input}/>
                                  <label htmlFor="print-button">
                                    <Button className={classes.printButton} variant="contained"  component="span" color="primary" fullWidth>
                                      Print
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
                )}
              </GetPrinterFormats>
            )}
          </GetPrinters>
        )}
      </QuickPrint>
    );
  }
}

QuickPrintModal.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  data: PropTypes.string.isRequired
};

export default withStyles(styles)(QuickPrintModal);
