import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import MenuItem from '@material-ui/core/MenuItem';
import GetPrinterFormats from '../queries/GetPrinterFormats';
import GetPrinters from '../queries/GetPrinters';
import GetPrinterHubs from '../queries/GetPrinterHubs';

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
      hub: '',
      printer: '',
      formatID: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange = e => this.setState({ [e.target.name]: e.target.value });

  handleSubmit = e => {
    e.preventDefault();
    return this.props.history.push(`/printers/${this.state.hub}?data=${this.props.data}&format=${this.state.formatID}&printer=${this.state.printer}`);
  }


  render() {
    const { classes, open, onClose } = this.props;
    return(
      <GetPrinterHubs>
        { hubs => (
          <GetPrinters>
            { printers => (
              <GetPrinterFormats withFields={false}>
                { printerFormats => (
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
                              Print
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
                                    label="Data"
                                    disabled={true}
                                    fullWidth
                                    margin="normal"
                                    value={this.props.data}
                                  />
                                </Grid>
                                <Grid item>
                                  {
                                    hubs ?
                                      <TextField
                                        name="hub"
                                        label="Select Hub"
                                        fullWidth
                                        select
                                        value={this.state.hub}
                                        onChange={this.handleChange}
                                        margin="none"
                                      >
                                        {
                                          hubs.map(h => (
                                            <MenuItem key={h.name} value={h.name}>
                                              {h.name}
                                            </MenuItem>
                                          ))
                                        }
                                      </TextField>
                                      : null
                                  }
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
                                    <Button
                                      disabled={!(this.state.hub && this.state.printer && this.state.formatID)}
                                      className={classes.printButton} variant="contained"  component="span" color="primary" fullWidth>
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
      </GetPrinterHubs>
    );
  }
}

QuickPrintModal.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  data: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired
};

export default withStyles(styles)(withRouter(QuickPrintModal));
