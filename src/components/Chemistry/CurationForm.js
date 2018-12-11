import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import StructureImage from './StructureImage';
import StructureEditor from './StructureEditor';

import CurateStructure from '../mutations/CurateStructure';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  form: {
    padding: theme.spacing.unit * 5,
    minWidth: '550px',
    minHeight: '400px'
  },
  registerButton: {
    paddingTop: theme.spacing.unit * 2
  },
  input: {
    display: 'none',
  },
  headerSection: {
    paddingBottom: theme.spacing.unit * 2
  },
  actions: {
    paddingTop: theme.spacing.unit * 5
  },
  textField: {
    paddingBottom: theme.spacing.unit * 3
  },
  paper: {
    maxWidth: theme.spacing.unit * 50,
    maxHeight: theme.spacing.unit * 50,
    margin:'auto'
  },
  structure: {
    width: theme.spacing.unit * 40,
    height: theme.spacing.unit * 40,
    padding: theme.spacing.unit * 3,
    margin:'auto'
  },
});

const dateTimeToString = (d) => {
  const date = new Date(d);
  date.setHours(date.getHours() - (date.getTimezoneOffset() / 60));
  return date.toLocaleDateString('en-US');
};

class CurationForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      molblock: '',
      reason: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleChange = e => {
    return this.setState({ [e.target.name] : e.target.value });
  }

  handleSubmit = (curateStructure, force) => e => {
    e.preventDefault();
    const { batchID: batch_id, author } = this.props;
    const { reason, molblock } = this.state;
    return curateStructure({
      molblock,
      reason,
      author,
      batch_id,
      force
    });
  }

  handleClose = (clearErrors) => () => {
    clearErrors();
    return this.props.history.goBack();
  }

  render() {

    const { classes, structure, batchID, author } = this.props;
    return(

      <CurateStructure>
        { (curateStructure, errors, clearErrors) => (
          <div className={classes.root}>
            <Dialog
              open={Boolean(errors.dialog)}
              onClose={() => clearErrors()}
              aria-labelledby="form-dialog-title"
            >
              <DialogTitle id="form-dialog-title">Curate Structure</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  The structure entered has previously been registered. After the structure update,
                  if there are no containers associated to the previous structure,
                  it will be removed from the database. Would you like to proceed?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => clearErrors()} color="secondary">
                  Cancel
                </Button>
                <Button onClick={this.handleSubmit(curateStructure, true)} color="primary">
                  Proceed
                </Button>
              </DialogActions>
            </Dialog>
            <Grid
              container
              justify="center"
              alignItems="center"
              direction="column"
              spacing={8}>
              <Grid item xs={12}>
                <Typography variant="display1" gutterBottom>
                  Curate Structure
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Paper className={classes.form} elevation={12}>
                  <form className={classes.container}
                    onSubmit={this.handleSubmit(curateStructure, false)}
                    noValidate
                    autoComplete="off">
                    <Grid
                      container
                      alignItems="flex-start"
                      spacing={16}>
                      <Grid item xs={12} lg={6}>
                        <Paper className={classes.paper} elevation={16}>
                          <StructureImage className={classes.structure} molblock={structure} />
                        </Paper>
                      </Grid>
                      <Grid item xs={12} lg={6}>
                        <StructureEditor
                          onChange={
                            (molblock) => this.handleChange({ target: {name: 'molblock', value: molblock }})
                          }
                          molblock={structure}
                        />
                        {
                          errors.molblock ? (
                            <Typography variant="subheading" color="error">
                              {errors.molblock}
                            </Typography>
                          ) : null
                        }
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          className={classes.textField}
                          label="Batch ID"
                          fullWidth
                          margin="none"
                          value={batchID}
                          disabled
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          className={classes.textField}
                          name="reason"
                          label="Reason for curation"
                          fullWidth
                          multiline
                          margin="none"
                          value={this.state.reason}
                          onChange={this.handleChange}
                          error={Boolean(errors.reason)}
                          helperText={errors.reason}
                        />
                      </Grid>
                    </Grid>
                    <Grid
                      container
                      alignItems='flex-end'
                      justify="space-between"
                      className={classes.actions}
                      spacing={32}>
                      <Grid item md={3} xs={12} className={classes.registerButton}>
                        <input type="submit" id="register-button" className={classes.input}/>
                        <label htmlFor="register-button">
                          <Button variant="contained"  component="span" color="primary" fullWidth>
                            Save
                          </Button>
                        </label>
                      </Grid>
                      <Grid item md={3} xs={12}>
                        <Button variant="contained" color="secondary" fullWidth onClick={this.handleClose(clearErrors)}>
                          Cancel
                        </Button>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subheading" color="textSecondary" align="right">
                          <i>Edited by {author}  at  {dateTimeToString(new Date())}</i>
                        </Typography>
                      </Grid>
                    </Grid>
                  </form>
                </Paper>
              </Grid>
            </Grid>
          </div>
        )}
      </CurateStructure>
    );
  }
}

CurationForm.propTypes = {
  classes: PropTypes.object.isRequired,
  author: PropTypes.string.isRequired,
  batchID: PropTypes.string.isRequired,
  structure: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired
};

export default withStyles(styles)(withRouter(CurationForm));
