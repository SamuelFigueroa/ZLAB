import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';

import AddDocument from './mutations/AddDocument';


const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
  },
  input: {
    display: 'none',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  icon: {
    verticalAlign: 'bottom',
    height: 20,
    width: 20,
  },
  details: {
    alignItems: 'center',
  },
  column: {
    flexBasis: '33.33%',
  },
  helper: {
    borderLeft: `2px solid ${theme.palette.divider}`,
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  panelButton: {
    float: 'left'
  },
  panelActions: {
    padding: theme.spacing.unit * 3
  }
});

const categories = ['SOP', 'Safety', 'Invoice', 'Maintenance', 'Manual'];

class DocumentForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state= {
      user: this.props.user.login,
      model: this.props.model,
      objID: this.props.objID,
      field: this.props.field,
      category: 'SOP',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleUpload = this.handleUpload.bind(this);

  }

  static contextTypes = {
    swipeableViews: PropTypes.object.isRequired,
  };

  componentDidUpdate() {
    setTimeout(() => this.context.swipeableViews.slideUpdateHeight(), this.props.theme.transitions.duration.shortest);
  }

  handleChange = e => {
    return this.setState({ [e.target.name] : e.target.value });
  }

  handleClose = (clearErrors, toggleForm) => () => {
    this.setState({ category: 'SOP' });
    clearErrors();
    return toggleForm();
  }

  handleUpload = (addDocument, validateInput, handleClose) => async ({
    target: {
      validity,
      files: [file]
    }
  }) => {
    if(validity.valid) {
      const { name, size, type, lastModified } = file;
      let validationResult = await validateInput({ name, size });
      if(validationResult !== undefined) {
        let result;
        if(type == 'application/json')
        {
          const reader = new FileReader();
          reader.onload = async () => {
            const newName = name.replace(/\.json$/, '.txt');
            let txtFile = new File([reader.result],
              newName, {
                type: 'text/plain',
                lastModified,
              });
            result = await addDocument(
              { file: txtFile, name: newName, size, ...this.state },
              [{query: this.props.query, variables: { id: this.state.objID }}]
            );
          };
          reader.readAsText(file);
        } else {
          result = await addDocument(
            { file, name, size, ...this.state },
            [{query: this.props.query, variables: { id: this.state.objID }}]
          );
        }
        if(result !== undefined) handleClose();
      }
    }
  }

  render() {
    const { classes, expanded, theme, toggleForm } = this.props;
    return (
      <AddDocument>
        { (addDocument, validateInput, errors, clearErrors) => (
          <div className={classes.root}>
            <ExpansionPanel expanded={expanded} CollapseProps={{
              timeout: {
                enter: 0,
                exit: theme.transitions.duration.shortest
              }
            }}>
              <ExpansionPanelSummary onClick={toggleForm}>
                <div className={classes.column}>
                  <Typography className={classes.heading}>Add Document</Typography>
                </div>
                <div className={classes.column}>
                  <Typography className={classes.secondaryHeading}>Create a new document entry</Typography>
                </div>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.details}>
                <Grid
                  container
                  alignItems="flex-start"
                  spacing={16}>
                  <Grid item xs={12}>
                    <TextField
                      name="category"
                      label="Select Category"
                      fullWidth
                      select
                      value={this.state.category}
                      onChange={this.handleChange}
                      margin="normal"
                    >
                      {categories.map(option => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </ExpansionPanelDetails>
              <Divider />
              <ExpansionPanelActions>
                <Grid
                  container
                  justify="flex-start"
                  alignItems="flex-end"
                  spacing={16}>
                  <Grid item>
                    <input
                      id="upload-file-button"
                      className={classes.input}
                      onChange={this.handleUpload(addDocument, validateInput, this.handleClose(clearErrors, toggleForm))}
                      required
                      type="file"
                    />
                    <label htmlFor="upload-file-button">
                      <Button variant="contained" color="primary" component="span">
                          Upload
                      </Button>
                    </label>
                  </Grid>
                  <Grid item>
                    <Button variant="contained" color="secondary" onClick={this.handleClose(clearErrors, toggleForm)}>
                        Cancel
                    </Button>
                  </Grid>
                  <Grid item>
                    <Typography variant="subtitle1" color="error">
                      {errors.name || errors.size}
                    </Typography>
                  </Grid>
                </Grid>
              </ExpansionPanelActions>
            </ExpansionPanel>
          </div>
        )}
      </AddDocument>
    );
  }
}

DocumentForm.propTypes = {
  classes: PropTypes.object.isRequired,
  expanded: PropTypes.bool.isRequired,
  theme: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  model: PropTypes.string.isRequired,
  field: PropTypes.string,
  query: PropTypes.object.isRequired,
  objID: PropTypes.string.isRequired,
  toggleForm: PropTypes.func.isRequired
};

export default withStyles(styles, { withTheme: true })(DocumentForm);
