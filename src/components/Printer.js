import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import PrintIcon from '@material-ui/icons/Print';
import DeleteIcon from '@material-ui/icons/RemoveCircle';
import PlayIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import Paper from '@material-ui/core/Paper';


import UpdatePrinter from './mutations/UpdatePrinter';
import AddPrinterJob from './mutations/AddPrinterJob';
import DeletePrinterJob from './mutations/DeletePrinterJob';

const styles = theme => ({
  barcodeField: {
    borderColor: theme.palette.primary.main,
    '&&&&:hover $barcodeOutline': {
      borderColor: theme.palette.primary.main,
    }
  },
  barcodeOutline:{ borderColor: theme.palette.primary.main },
  logField: {
    borderColor: theme.palette.primary.main,
    '&&&&:hover $logOutline': {
      borderColor: theme.palette.primary.main,
    },
    backgroundClip: 'padding-box',
    backgroundColor: theme.palette.grey[100]
  },
  logOutline: {
    borderColor: theme.palette.primary.main,
    borderWidth: 'medium'
  },
  logText: {
    color: theme.palette.text.primary,
    fontSize: theme.typography.subheading.fontSize,
  },
  logLabel: {
    color: theme.palette.primary.main,
    fontSize: theme.typography.title.fontSize,
    backgroundColor: theme.palette.background.paper,
    zIndex: 1
  },
  barcodeLabel: {
    color: theme.palette.primary.main,
    fontSize: theme.typography.title.fontSize,
  },
  printButton: {
    [theme.breakpoints.down('sm')]: {
      left: 0,
      width: '100%'
    },
    [theme.breakpoints.up('md')]: {
      right: 0,
      marginLeft: theme.spacing.unit * 2,
    },
    position: 'relative',
    lineHeight: theme.typography.display1.fontSize,
  },
  jobs: {
    paddingTop: theme.spacing.unit,
    overflow: 'auto',
    maxHeight: 300
  },
  barcode: {
    position: 'relative',
    right: 0
  },
  logQSection: {
    paddingTop: theme.spacing.unit * 3
  },
  subheader: {
    backgroundColor: theme.palette.background.paper
  },
});

class Printer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      barcode: this.props.barcode,
      status: '',
      logEntries: this.props.printer.log.length
    };
    this.handleChange = this.handleChange.bind(this);
    this.formatLog = this.formatLog.bind(this);
    this.setInputRef = this.setInputRef.bind(this);
    this.messages = React.createRef();
    this.formatZpl = this.formatZpl.bind(this);
    this.previewZpl = this.previewZpl.bind(this);
  }

  setInputRef = el => {
    this.messages = el;
  }

  handleChange = e => {
    return this.setState({ [e.target.name] : e.target.value });
  }

  formatLog = (arr) => arr.join('\n');

  //There needs to be a label format editor.
  formatZpl = (barcode) => `
    ^XA
    ^FO50,50
    ^A0N,40
    ^FN7
    ^FS
    ^RFW,A
    ^FD${barcode}
    ^FS
    ^FN7
    ^RFR,A
    ^FS
    ^XZ`;

  previewZpl = (barcode) =>
    `^XA
    ^FO50,50
    ^ADN,36,20
    ^FD${barcode}^FS
    ^XZ`;

  componentDidUpdate () {
    if (this.props.printer.log.length > this.state.logEntries) {
      this.messages.scrollTop = this.messages.scrollHeight + 20;
      this.setState({ logEntries: this.props.printer.log.length });
    }
  }

  render() {
    const { classes, printer, actions } = this.props;
    const { jobs, name, queue, log, connection_name, preview } = printer;
    const { startQueue, pauseQueue, queueJob, deleteJob, previewLabel } = actions;
    return (
      <AddPrinterJob>
        { (addPrinterJob, addErrors) => (
          <DeletePrinterJob>
            { (deletePrinterJob, deleteErrors) => (
              <UpdatePrinter>
                { (updatePrinter, updateErrors) => (
                  <Grid
                    container
                    alignItems="center"
                    spacing={8}>
                    <Grid item xs={12} md={2}>
                      <Grid container alignItems="center" spacing={8}>
                        <Grid item>
                          <PrintIcon fontSize="large" color="primary"/>
                        </Grid>
                        <Grid item>
                          <Typography variant="title" color="primary">
                            {name}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        name="barcode"
                        label="Barcode"
                        value={this.state.barcode}
                        onChange={this.handleChange}
                        margin="none"
                        variant="outlined"
                        className={classes.barcode}
                        error={addErrors[connection_name] && Boolean(addErrors[connection_name].barcode)}
                        helperText={addErrors[connection_name] && addErrors[connection_name].barcode }
                        InputLabelProps={{
                          FormLabelClasses: {
                            root: classes.barcodeLabel
                          }
                        }}
                        InputProps={{
                          classes: {
                            root: classes.barcodeField,
                            notchedOutline: classes.barcodeOutline
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        className={classes.printButton}
                        onClick={async () => await previewLabel(this.previewZpl(this.state.barcode))}
                      >
                        Preview
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        className={classes.printButton}
                        onClick={async () => {
                          const time_added = new Date();
                          await queueJob(addPrinterJob,
                            { name: this.state.barcode,
                              data: this.formatZpl(this.state.barcode),
                              time_added: time_added.toLocaleString()
                            });
                        }}
                      >
                        Queue Job
                      </Button>
                    </Grid>
                    {
                      queue ? (
                        <Grid item xs={12} sm={2}>
                          <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.printButton}
                            onClick={async () => await pauseQueue(updatePrinter)}
                          >
                            Pause
                            <PauseIcon className={classes.rightIcon} />
                          </Button>
                        </Grid>
                      ) : (
                        <Grid item xs={12} sm={2}>
                          <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.printButton}
                            onClick={async () => await startQueue(updatePrinter)}
                          >
                            Start
                            <PlayIcon className={classes.rightIcon} />
                          </Button>
                        </Grid>
                      )
                    }
                    <Grid
                      container
                      alignItems="flex-start"
                      className={classes.logQSection}
                    >
                      <Grid item xs={12} md={8}>
                        <TextField
                          fullWidth
                          label="Printer Log"
                          multiline
                          rowsMax="13"
                          value={this.formatLog(log)}
                          margin="normal"
                          variant="outlined"
                          InputLabelProps={{
                            FormLabelClasses: {
                              root: classes.logLabel
                            }
                          }}
                          InputProps={{
                            readOnly: true,
                            inputRef: this.setInputRef,
                            classes: {
                              root: classes.logField,
                              notchedOutline: classes.logOutline,
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <List
                          className={classes.jobs}
                          subheader={
                            <ListSubheader className={classes.subheader}>
                              <Typography variant="subheading" color="primary">
                              Printer Queue
                              </Typography>
                            </ListSubheader>
                          }>
                          {
                            jobs.map( job => (
                              <ListItem disabled={job.status == 'InProgress'} key={job.id}>
                                <ListItemText
                                  primary={job.status == 'InProgress' ? `${job.name} (In Progress)`: job.name }
                                  secondary={job.time_added}/>
                                <ListItemSecondaryAction>
                                  <IconButton
                                    disabled={job.status == 'InProgress'}
                                    aria-label="Delete"
                                    onClick={ async () => await deleteJob(deletePrinterJob, job.id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                            ))}
                        </List>
                      </Grid>
                    </Grid>
                    {
                      preview ? (
                        <Grid item style={{ width: '100%', padding: '0' }} xs={12}>
                          <Paper elevation={8}>
                            <img src={`data:image/png;base64,${preview}`} alt="Label Preview" />
                          </Paper>
                        </Grid>
                      ) : null
                    }
                    { addErrors[connection_name] ? (
                      <Grid item xs={12}>
                        <Typography variant="subheading" color="error">
                          {addErrors[connection_name].add}
                        </Typography>
                      </Grid>
                    ) : null }
                    { deleteErrors[connection_name] ? (
                      <Grid item xs={12}>
                        <Typography variant="subheading" color="error">
                          {deleteErrors[connection_name].delete}
                        </Typography>
                      </Grid>
                    ) : null }
                    { updateErrors[connection_name] ? (
                      <Grid item xs={12}>
                        <Typography variant="subheading" color="error">
                          {updateErrors[connection_name].update}
                        </Typography>
                      </Grid>
                    ) : null }
                  </Grid>
                )}
              </UpdatePrinter>
            )}
          </DeletePrinterJob>
        )}
      </AddPrinterJob>
    );
  }
}

Printer.propTypes = {
  classes: PropTypes.object.isRequired,
  printer: PropTypes.object.isRequired,
  barcode: PropTypes.string,
  actions: PropTypes.object.isRequired
};

export default withStyles(styles)(Printer);
