import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';

import Printer from './Printer';
import GetPrinterFormats from '../queries/GetPrinterFormats';
import UpdatePrinter from '../mutations/UpdatePrinter';
import AddPrinterJob from '../mutations/AddPrinterJob';
import DeletePrinterJob from '../mutations/DeletePrinterJob';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit
  },
  background: {
    padding: theme.spacing.unit * 5
  },
  hub: {
    paddingTop: theme.spacing.unit * 3,
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

class PrinterHub extends PureComponent {
  constructor(props) {
    super(props);

    this.startQueue = this.startQueue.bind(this);
    this.pauseQueue = this.pauseQueue.bind(this);
    this.queueJob = this.queueJob.bind(this);
    this.deleteJob = this.deleteJob.bind(this);
    this.previewLabel = this.previewLabel.bind(this);
  }
  static contextTypes = {
    swipeableViews: PropTypes.object.isRequired,
  };

  componentDidUpdate() {
    setTimeout(() => this.context.swipeableViews.slideUpdateHeight(), this.props.theme.transitions.duration.standard);
  }

  componentDidMount() {
    setTimeout(() => this.context.swipeableViews.slideUpdateHeight(), this.props.theme.transitions.duration.standard);
  }

  startQueue = connection_name => async updatePrinter => {
    // Update printer checks whether there are jobs in the queue, if true turns queue on,
    // and changes the status of the next job to 'In Progress'
    let response = await updatePrinter({ connection_name, reset: false, queue: true });
    const started = response !== undefined ? true : false;
    if (started) {
      await this.props.connection.invoke('StartQueue', connection_name);
    }
  }

  pauseQueue = connection_name => async updatePrinter => {
    // Update printer checks whether there are jobs in the queue, if true turns queue off,
    // and changes the status of the job 'In Progress' to 'Queued' if reset is true.
    await updatePrinter({ connection_name, reset: false, queue: false });
    await this.props.connection.invoke('RefreshQueue', connection_name);
  }

  queueJob = connection_name => async (addPrinterJob, job) => {
    let response = await addPrinterJob({ connection_name, job });
    const added = response !== undefined ? true : false;
    if (added)
      await this.props.connection.invoke('RefreshQueue', connection_name); //broadcast queued job
  }

  deleteJob = connection_name => async (deletePrinterJob, jobID) => {
    await deletePrinterJob({ connection_name, dequeue: false, jobID });
    await this.props.connection.invoke('RefreshQueue', connection_name); // broadcast job removal
  }

  previewLabel = connection_name => async (zpl) => {
    await this.props.connection.invoke('PreviewZpl', connection_name, zpl);
  }


  render() {
    const { classes, name, printers, status, print } = this.props;
    return (
      <div className={classes.root}>
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
                    { status }
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Paper className={classes.hub}>
                    { printers.length ? (
                      printers.map( printer =>
                        <div key={printer.id}>
                          <GetPrinterFormats withFields={true}>
                            { printerFormats => (
                              <AddPrinterJob>
                                { (addPrinterJob, addErrors) => (
                                  <DeletePrinterJob>
                                    { (deletePrinterJob, deleteErrors) => (
                                      <UpdatePrinter>
                                        { (updatePrinter, updateErrors) => (
                                          <Printer
                                            printer={printer}
                                            mutations={{
                                              addPrinterJob, addErrors,
                                              updatePrinter, updateErrors,
                                              deletePrinterJob, deleteErrors
                                            }}
                                            printerFormats={printerFormats}
                                            print={
                                              (print !== undefined && print.printer == printer.name) ?
                                                print : null
                                            }
                                            actions={{
                                              startQueue: this.startQueue(printer.connection_name),
                                              pauseQueue: this.pauseQueue(printer.connection_name),
                                              queueJob: this.queueJob(printer.connection_name),
                                              deleteJob: this.deleteJob(printer.connection_name),
                                              previewLabel: this.previewLabel(printer.connection_name)
                                            }}
                                          />
                                        )}
                                      </UpdatePrinter>
                                    )}
                                  </DeletePrinterJob>
                                )}
                              </AddPrinterJob>
                            )}
                          </GetPrinterFormats>
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
  name: PropTypes.string.isRequired,
  theme: PropTypes.object.isRequired,
  printers: PropTypes.array.isRequired,
  status: PropTypes.string.isRequired,
  connection: PropTypes.object,
  print: PropTypes.object
};

export default withStyles(styles, { withTheme: true })(PrinterHub);
