import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';

import * as signalR from '@aspnet/signalr';
import Printer from './Printer';
import AddPrinterModal from './AddPrinterModal';


const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit
  },
  background: {
    padding: theme.spacing.unit * 5
  },
  hub: {
    paddingTop: theme.spacing.unit * 5,
    paddingLeft: theme.spacing.unit * 5,
    paddingRight: theme.spacing.unit * 5,
    paddingBottom: theme.spacing.unit
  },
  headerSection: {
    paddingBottom: theme.spacing.unit * 3
  },
  divider: {
    marginTop: theme.spacing.unit * 5,
    marginBottom: theme.spacing.unit * 5,
    paddingTop: '4px',
    backgroundColor: theme.palette.primary.light
  }
});

class PrinterHub extends Component {
  constructor(props) {
    super(props);
    this.state = {
      connection: new signalR.HubConnectionBuilder()
        .withUrl(this.props.address)
        .configureLogging(signalR.LogLevel.Trace)
        .build(),
      error: '',
      printers: [],
      modals: [],
    };
    this.openModal = this.openModal.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.registerPrinters = this.registerPrinters.bind(this);
    this.startQueue = this.startQueue.bind(this);
    this.pauseQueue = this.pauseQueue.bind(this);
    this.queueJob = this.queueJob.bind(this);
    this.deleteJob = this.deleteJob.bind(this);
    this.previewLabel = this.previewLabel.bind(this);
    this.fetchPrinterJobs = this.fetchPrinterJobs.bind(this);
  }

  async componentDidMount() {
    if (this.state.connection !== null) {
      try {
        await this.state.connection.start();
        // Define all SignalR event handlers
        await this.state.connection.on('PrintersFound',
          async (printers) => await this.registerPrinters(printers));
        await this.registerPrinters(['test_connection']);
        // Listen to messages from hub
        await this.state.connection.on('LogMessage',
          (printer, message) => {
            const printers = this.state.printers.map( p => {
              if(p.connection_name == printer)
                p.log = p.log.concat(message);
              return p;
            });
            this.setState({ printers });
          });
        await this.state.connection.on('QueueUpdated',
          async (connection_name) => await this.fetchPrinterJobs(connection_name));

        await this.state.connection.on('ShowPreview',
          async (connection_name, imageData) => {
            const printers = this.state.printers.map( p => {
              if(p.connection_name == connection_name)
                p.preview = imageData;
              return p;
            });
            this.setState({ printers });
          });

        // Get USB connected printers
        await this.state.connection.invoke('GetPrinters');

      } catch (err) {
        console.log(err);
        this.setState({ error: 'Failed to establish a connection with this printer hub.' });
      }
    } else {
      this.setState({ error: 'This printer hub appears to be offline.' });
    }
  }

  async componentWillUnmount() {
    if (this.state.connection !== null)
      await this.state.connection.stop();
  }

  openModal = () => {
    if(this.state.modals.length) {
      const modalArr = [...this.state.modals];
      const nextModal = modalArr.shift();
      nextModal.open = true;
      modalArr.unshift(nextModal);
      this.setState({ modals: modalArr });
    }
  };

  handleModalClose = printer => async (event, reason) => {
    const modalArr = [...this.state.modals];
    const printerArr = [...this.state.printers];
    if (reason != 'escapeKeyDown' && reason != 'backdropClick') {
      let newPrinter = await this.props.actions.getPrinter(printer);
      const printerObj = Object.assign({}, {...newPrinter });
      printerObj.log = ['Printer found.'];
      printerObj.preview = null;
      printerArr.push(printerObj);
    }
    modalArr.shift();
    this.setState({ printers: printerArr, modals: modalArr }, this.openModal);
  }

  registerPrinters =
    async printers => {
      const printerArr = [];
      const modalArr = [];
      for (const printer of printers) {
        let knownPrinter = await this.props.actions.getPrinter(printer);
        if (!knownPrinter) {
          modalArr.push({
            open: false,
            connection_name: printer
          });
        } else {
          const printerObj = Object.assign({}, {...knownPrinter });
          printerObj.log = ['Printer found.'];
          printerObj.preview = null;
          printerArr.push(printerObj);
        }
      }
      this.setState({ printers: printerArr, modals: modalArr }, this.openModal);
    }

  fetchPrinterJobs = async connection_name => {
    let printer = await this.props.actions.getPrinter(connection_name);
    const { jobs, queue } = printer;
    const printers = this.state.printers.map( p => {
      if(p.connection_name == connection_name) {
        p.jobs = jobs;
        p.queue = queue;
      }
      return p;
    });
    this.setState({ printers });
  }


  startQueue = connection_name => async updatePrinter => {
    // Update printer checks whether there are jobs in the queue, if true turns queue on,
    // and changes the status of the next job to 'In Progress'
    let response = await updatePrinter({ connection_name, reset: false, queue: true });
    const started = response !== undefined ? true : false;
    if (started) {
      await this.state.connection.invoke('StartQueue', connection_name);
    }
  }

  pauseQueue = connection_name => async updatePrinter => {
    // Update printer checks whether there are jobs in the queue, if true turns queue off,
    // and changes the status of the job 'In Progress' to 'Queued' if reset is true.
    await updatePrinter({ connection_name, reset: false, queue: false });
    await this.state.connection.invoke('RefreshQueue', connection_name);
  }

  queueJob = connection_name => async (addPrinterJob, job) => {
    let response = await addPrinterJob({ connection_name, job });
    const added = response !== undefined ? true : false;
    if (added)
      await this.state.connection.invoke('RefreshQueue', connection_name); //broadcast queued job
  }

  deleteJob = connection_name => async (deletePrinterJob, jobID) => {
    await deletePrinterJob({ connection_name, dequeue: false, jobID });
    await this.state.connection.invoke('RefreshQueue', connection_name); // broadcast job removal
  }

  previewLabel = connection_name => async (zpl) => {
    await this.state.connection.invoke('PreviewZpl', connection_name, zpl);
  }


  render() {
    const { classes, name, barcode } = this.props;
    const { printers, error, modals } = this.state;
    return (
      <div className={classes.root}>
        {
          modals.map( modal => (
            <AddPrinterModal
              key={modal.connection_name}
              open={modal.open}
              onClose={this.handleModalClose(modal.connection_name)}
              connection_name={modal.connection_name} />
          ))
        }
        <Grid
          container
          justify="center"
          alignItems="center"
          spacing={8}>
          <Grid item xs={12}>
            <Paper className={classes.background} elevation={0} square={true}>
              <Grid
                container
                className={classes.headerSection}
                alignItems="flex-end"
                spacing={16}>
                <Grid item xs={6}>
                  <Typography variant="headline" color="primary" gutterBottom>
                    {name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="title" color="textSecondary" align="right" gutterBottom>
                    { error || 'Online' }
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Paper className={classes.hub}>
                    { printers.length ? (
                      printers.map( printer =>
                        <div key={printer.id}>
                          <Printer
                            printer={printer}
                            actions={{
                              startQueue: this.startQueue(printer.connection_name),
                              pauseQueue: this.pauseQueue(printer.connection_name),
                              queueJob: this.queueJob(printer.connection_name),
                              deleteJob: this.deleteJob(printer.connection_name),
                              previewLabel: this.previewLabel(printer.connection_name)
                            }}
                            barcode={barcode || ''}/>
                          <Divider className={classes.divider}/>
                        </div>
                      )
                    ) : (
                      <Typography variant="display1" align="center" >There are no printers connected to this hub.</Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

PrinterHub.propTypes = {
  classes: PropTypes.object.isRequired,
  address: PropTypes.string.isRequired,
  barcode: PropTypes.string,
  actions: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired
};

export default withStyles(styles)(PrinterHub);
