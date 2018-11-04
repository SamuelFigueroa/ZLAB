import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
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

import ZPLFormatter from './ZPLFormatter';



const styles = theme => ({
  formatField: {
    borderColor: theme.palette.primary.main,
    '&&&&:hover $fieldOutline': {
      borderColor: theme.palette.primary.main,
    }
  },
  fieldOutline:{ borderColor: theme.palette.primary.main },
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
  fieldLabel: {
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
  field: {
    position: 'relative',
    right: 0
  },
  section: {
    paddingTop: theme.spacing.unit * 3
  },
  subheader: {
    backgroundColor: theme.palette.background.paper
  },
  format: {
    paddingBottom: theme.spacing.unit * 3
  }
});

class Printer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      status: '',
      logEntries: this.props.printer.log.length,
      format: {},
      formatVars: {},
      formatFn: null,
      previewVars: {},
      previewFn: null
    };
    this.handleChange = this.handleChange.bind(this);
    this.formatLog = this.formatLog.bind(this);
    this.setInputRef = this.setInputRef.bind(this);
    this.messages = React.createRef();
  }
  static contextTypes = {
    swipeableViews: PropTypes.object.isRequired,
  };

  setInputRef = el => {
    this.messages = el;
  }

  handleChange = e => this.setState({ [e.target.name] : e.target.value });

  formatLog = (arr) => arr.join('\n');

  async componentDidMount() {
    setTimeout(() => this.context.swipeableViews.slideUpdateHeight(), this.props.theme.transitions.duration.complex);
    const { print, printerFormats } = this.props;
    if(print) {
      const format =  printerFormats.find(f=>f.id == print.format);
      if(format) {
        const { defaults, fields, name } = format;
        const { format: formatFn, vars: formatVars } = ZPLFormatter(defaults, fields, false);
        const variableArray = Object.keys(formatVars);
        if (!(variableArray.length > 1)) {
          if (variableArray.length == 1) {
            formatVars[variableArray[0]] = print.data;
          }
          const { format: previewFn, vars: previewVars } = ZPLFormatter(defaults, fields, true);
          const time_added = new Date();
          const { printer, actions, mutations } = this.props;
          const { queue } = printer;
          const { startQueue, queueJob } = actions;
          const { addPrinterJob, updatePrinter } = mutations;
          await queueJob(addPrinterJob,
            { name,
              data: formatFn(formatVars),
              time_added: time_added.toLocaleString()
            });
          if(queue === false)
            await startQueue(updatePrinter);
          this.setState({ format, formatVars, formatFn, previewVars, previewFn });
        }
      }
    }
  }

  componentDidUpdate () {
    if (this.props.printer.log.length > this.state.logEntries) {
      this.messages.scrollTop = this.messages.scrollHeight + 20;
      this.setState({ logEntries: this.props.printer.log.length });
    }
    setTimeout(() => this.context.swipeableViews.slideUpdateHeight(), this.props.theme.transitions.duration.complex);
  }

  render() {
    const { classes, printer, actions, printerFormats, mutations } = this.props;
    const { addPrinterJob, addErrors, updatePrinter, updateErrors, deletePrinterJob, deleteErrors } = mutations;

    const { format } = this.state;
    const { jobs, name, queue, log, connection_name, preview } = printer;
    const { startQueue, pauseQueue, queueJob, deleteJob, previewLabel } = actions;
    return (
      <Grid
        container
        alignItems="center"
        spacing={8}
      >
        <Grid item xs={6}>
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
        <Grid item xs={6}>
          {
            printerFormats ?
              <TextField
                className={classes.format}
                name="format"
                label="Select Format"
                fullWidth
                select
                value={Object.keys(format).length !== 0 ? format.name : ''}
                onChange={e => {
                  const format =  printerFormats.find(f=>f.name == e.target.value);
                  const { defaults, fields } = format;
                  const { format: formatFn, vars: formatVars } = ZPLFormatter(defaults, fields, false);
                  const { format: previewFn, vars: previewVars } = ZPLFormatter(defaults, fields, true);
                  return this.setState({ format, formatFn, formatVars, previewFn, previewVars});
                }}
                margin="none"
              >
                {
                  printerFormats.map(f => (
                    <MenuItem key={f.name} value={f.name}>
                      {f.name}
                    </MenuItem>
                  ))
                }
              </TextField>
              : null
          }
        </Grid>
        <Grid item xs={12} sm={6}>
          <Grid container direction="column">
            {
              Object.keys(this.state.formatVars).map(v => (
                <Grid key={v} item xs={12}>
                  <TextField
                    fullWidth
                    label={v}
                    value={this.state.formatVars[v]}
                    onChange={
                      e => {
                        let state = { formatVars: {...this.state.formatVars, [v]: e.target.value } };
                        if(Object.keys(this.state.previewVars).indexOf(v) != -1) {
                          state.previewVars = {...this.state.previewVars, [v]: e.target.value };
                        }
                        return this.setState(state);
                      }

                    }
                    margin="none"
                    variant="outlined"
                    className={classes.field}
                    InputLabelProps={{
                      FormLabelClasses: {
                        root: classes.fieldLabel
                      }
                    }}
                    InputProps={{
                      classes: {
                        root: classes.formatField,
                        notchedOutline: classes.fieldOutline
                      }
                    }}
                  />
                </Grid>
              ))
            }
          </Grid>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={Object.keys(format).length == 0}
            className={classes.printButton}
            onClick={async () => await previewLabel(this.state.previewFn(this.state.previewVars))}
          >
        Preview
          </Button>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={Object.keys(format).length == 0}
            className={classes.printButton}
            onClick={async () => {
              const time_added = new Date();
              await queueJob(addPrinterJob,
                { name: this.state.format.name,
                  data: this.state.formatFn(this.state.formatVars),
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
          className={classes.section}
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
    );
  }
}

Printer.propTypes = {
  classes: PropTypes.object.isRequired,
  printer: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  printerFormats: PropTypes.array.isRequired,
  mutations: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(Printer);
