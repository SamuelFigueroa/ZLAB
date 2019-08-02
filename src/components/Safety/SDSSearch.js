import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import InfoIcon from '@material-ui/icons/Info';
import SDSSearchTable from './SDSSearchTable';

import SearchChemicalSafety from '../queries/SearchChemicalSafety';
import AddSafetyDataSheet from '../mutations/AddSafetyDataSheet';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
  },
  title: {
    paddingBottom: theme.spacing.unit * 6
  },
  info: {
    color: theme.palette.secondary.main,
    marginRight: '6px'
  },
  error: {
    color: theme.palette.error.main
  },
  input: {
    display: 'none',
  },
  button: {
    marginTop: theme.spacing.unit * 3
  }
});

class SDSSearch extends Component {
  constructor(props){
    super(props);
    this.state = {
      selected: null
    };
    this.handleClose = this.handleClose.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
  }

  handleClose = (clearErrors) => () => {
    clearErrors();
    return this.props.history.goBack();
  }

  handleSubmit = (addSafetyDataSheet, handleClose) => async () => {
    const { compound, user } = this.props;
    const { selected: sds_id } = this.state;
    let result = await addSafetyDataSheet({ compound, user: user.login, sds_id, upload: null });
    if(result !== undefined) handleClose();
  }

  handleUpload = (addSafetyDataSheet, validateUpload, handleClose) => async ({
    target: {
      validity,
      files: [file]
    }
  }) => {
    const { compound, user } = this.props;
    const input = { compound, user: user.login, sds_id: '' };
    if(validity.valid) {
      const { name, size, type, lastModified } = file;
      let validationResult = await validateUpload({ name, size });
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
            input.upload = { file: txtFile, name: newName, size };
            result = await addSafetyDataSheet(input);
          };
          reader.readAsText(file);
        } else {
          input.upload = { file, name, size };
          result = await addSafetyDataSheet(input);
        }
        if(result !== undefined) handleClose();
      }
    }
  }

  render() {
    const { classes, compound } = this.props;
    return (
      <AddSafetyDataSheet>
        { (addSafetyDataSheet, validateUpload, loading, errors, clearErrors) => (
          <SearchChemicalSafety>
            { (searchChemicalSafety, searchErrors) => (
              <div className={classes.root}>
                <Grid
                  container
                  justify="center"
                  alignItems="center"
                >
                  <Grid item xs={12}>
                    <Typography align="center" variant="h4" className={classes.title}>
                    SDS Search Results
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container alignItems="center">
                      <Grid item>
                        <InfoIcon className={classes.info}/>
                      </Grid>
                      <Grid item>
                        <Typography variant="subtitle1">
                          {'Select the SDS to associate with the compound. Choosing one from \'SIGMA ALDRICH\' is highly recommended.'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  { errors.name ? (
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" color="error" align="right">
                        Error: {errors.name}
                      </Typography>
                    </Grid>
                  ) : null
                  }
                  { errors.size ? (
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" color="error" align="right">
                        Error: {errors.size}
                      </Typography>
                    </Grid>
                  ) : null
                  }
                  { errors.upload ? (
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" color="error" align="right">
                        Error: {errors.upload}
                      </Typography>
                    </Grid>
                  ) : null }
                  <Grid item xs={12}>
                    <SDSSearchTable
                      searchChemicalSafety={async () => await searchChemicalSafety(compound)}
                      onRowClick={id => () => this.setState({ selected: id })}
                      selected={this.state.selected}
                      toolbarProps={{
                        rightHeader: searchErrors.compound ? (
                          <Grid item>
                            <Typography variant="h5" className={classes.error}>
                              {searchErrors.compound}
                            </Typography>
                          </Grid>
                        ) : (
                          this.state.selected === null ? (
                            <Grid item>
                              <Typography variant="h5" color="textSecondary">
                               Loading results...
                              </Typography>
                            </Grid>
                          ) : (
                            this.state.selected === '' ? (
                              <Grid item>
                                <Typography variant="h5" color="textSecondary">
                                  {'Search didn\'t match any SDS'}
                                </Typography>
                              </Grid>
                            ) : (
                              <Grid item xs={6}>
                                <Grid
                                  container
                                  alignItems="center"
                                  spacing={8}>
                                  <Grid item xs={8}>
                                    <Grid container alignItems="center" justify="center">
                                      <Grid item xs={5}>
                                        <Button variant="contained" disabled={loading} component="span" color="primary" onClick={this.handleSubmit(addSafetyDataSheet, this.handleClose(clearErrors))} fullWidth>
                                          {loading ? 'Linking...': 'Link SDS'}
                                        </Button>
                                      </Grid>
                                      <Grid item xs={2}>
                                        <Typography variant="subtitle1" color="primary" align="center">
                                    - or -
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={5}>
                                        <input
                                          id="upload-file-button"
                                          className={classes.input}
                                          onChange={this.handleUpload(addSafetyDataSheet, validateUpload, this.handleClose(clearErrors))}
                                          required
                                          type="file"
                                        />
                                        <label htmlFor="upload-file-button">
                                          <Button variant="contained" color="primary" component="span" fullWidth>
                                            Upload
                                          </Button>
                                        </label>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                  <Grid item xs={4}>
                                    <Button variant="contained"  component="span" color="secondary" onClick={this.handleClose(clearErrors)} fullWidth>
                                      Cancel
                                    </Button>
                                  </Grid>
                                </Grid>
                              </Grid>
                            )))
                      }} />
                  </Grid>
                  { (searchErrors.compound || this.state.selected === '') ? (
                    <Grid item xs={12}>
                      <Grid
                        container
                        alignItems="center"
                        spacing={8}>
                        <Grid item xs={2}>
                          <input
                            id="upload-file-button"
                            className={classes.input}
                            onChange={this.handleUpload(addSafetyDataSheet, validateUpload, this.handleClose(clearErrors))}
                            required
                            type="file"
                          />
                          <label htmlFor="upload-file-button">
                            <Button className={classes.button} variant="contained" color="primary" component="span" fullWidth>
                                Upload
                            </Button>
                          </label>
                        </Grid>
                        <Grid item xs={2}>
                          <Button variant="contained" className={classes.button} component="span" color="secondary" onClick={this.handleClose(clearErrors)} fullWidth>
                            Cancel
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  ) : null }
                </Grid>
              </div>
            )}
          </SearchChemicalSafety>
        )}
      </AddSafetyDataSheet>
    );
  }
}

SDSSearch.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  compound: PropTypes.string.isRequired
};

export default withStyles(styles)(withRouter(SDSSearch));
