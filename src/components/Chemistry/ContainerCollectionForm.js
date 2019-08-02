import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import AddContainerCollection from '../mutations/AddContainerCollection';
import ExportRegistrationTemplate from '../mutations/ExportRegistrationTemplate';

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
  },
});

class ContainerCollectionForm extends PureComponent {
  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.handleTemplateDownload = this.handleTemplateDownload.bind(this);
    this.fileInput = React.createRef();
  }

  handleTemplateDownload = exportRegistrationTemplate => async () => {
    let docURL = await exportRegistrationTemplate();
    window.open(docURL, '');
  }

  handleClose = (clearErrors, toggleForm) => () => {
    clearErrors();
    return toggleForm();
  }

  handleUpload = (addContainerCollection, validateInput, handleClose) => async ({
    target: {
      validity,
      files: [file]
    }
  }) => {
    if(validity.valid) {
      const { name, size, type, lastModified } = file;
      let validationResult = await validateInput({ name, size });
      if(validationResult !== undefined) {
        const user = this.props.user.login;
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
            result = await addContainerCollection(
              { file: txtFile, name: newName, size, user },
            );
          };
          reader.readAsText(file);
        } else {
          result = await addContainerCollection(
            { file, name, size, user },
          );
        }
        if(result !== undefined) handleClose();
      }
    }
    this.fileInput.current.value = null;
  }

  render() {
    const { classes, expanded, theme, toggleForm } = this.props;
    return (
      <ExportRegistrationTemplate>
        { exportRegistrationTemplate => (
          <AddContainerCollection>
            { (addContainerCollection, validateInput, errors, clearErrors) => (
              <div className={classes.root}>
                <ExpansionPanel expanded={expanded} CollapseProps={{
                  timeout: {
                    enter: 0,
                    exit: theme.transitions.duration.shortest
                  }
                }}>
                  <ExpansionPanelSummary onClick={toggleForm}>
                    <div className={classes.column}>
                      <Typography className={classes.heading}>Add Collection</Typography>
                    </div>
                    <div className={classes.column}>
                      <Typography className={classes.secondaryHeading}>Create a new collection entry</Typography>
                    </div>
                  </ExpansionPanelSummary>
                  <ExpansionPanelActions>
                    <Grid
                      container
                      justify="flex-start"
                      alignItems="flex-end"
                      spacing={16}>
                      <Grid item>
                        <input
                          id="upload-file-button"
                          ref={this.fileInput}
                          className={classes.input}
                          onChange={this.handleUpload(addContainerCollection, validateInput, this.handleClose(clearErrors, toggleForm))}
                          required
                          type="file"
                        />
                        <label htmlFor="upload-file-button">
                          <Button variant="contained" color="primary" component="span">
                              Upload CSV file
                          </Button>
                        </label>
                      </Grid>
                      <Grid item>
                        <Button variant="contained" color="secondary" onClick={this.handleClose(clearErrors, toggleForm)}>
                            Cancel
                        </Button>
                      </Grid>
                      <Grid item>
                        <Button variant="contained" color="primary" onClick={this.handleTemplateDownload(exportRegistrationTemplate)}>
                            Download template
                        </Button>
                      </Grid>
                      {
                        (errors && errors.file !== undefined) ? (
                          <Grid item xs={12}>
                            <Typography variant="subtitle1" color="error">
                              {errors.file}
                            </Typography>
                          </Grid>
                        ) : null
                      }
                      {
                        (errors && Object.keys(errors).length) ? (
                          Object.keys(errors).filter(k => k != 'file').map(key => (
                            <Grid item xs={12} key={key}>
                              <Typography variant="subtitle1" color="error">
                                * {errors[key]}
                              </Typography>
                            </Grid>
                          ))
                        ) : null
                      }
                    </Grid>
                  </ExpansionPanelActions>
                </ExpansionPanel>
              </div>
            )}
          </AddContainerCollection>
        )}
      </ExportRegistrationTemplate>
    );
  }
}

ContainerCollectionForm.propTypes = {
  classes: PropTypes.object.isRequired,
  expanded: PropTypes.bool.isRequired,
  theme: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  toggleForm: PropTypes.func.isRequired
};

export default withStyles(styles, { withTheme: true })(ContainerCollectionForm);
