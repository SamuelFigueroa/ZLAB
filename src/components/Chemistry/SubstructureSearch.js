import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';

import StructureEditor from './StructureEditor';
import Tooltip from '@material-ui/core/Tooltip';
import SubstructureIcon from '@material-ui/icons/DeviceHub';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
  },
  title: {
    paddingBottom: theme.spacing.unit
  },
  registerButton: {
    paddingTop: theme.spacing.unit * 2
  },
  input: {
    display: 'none',
  },
  button: {
    marginLeft: theme.spacing.unit
  }
});

class SubstructureSearch extends Component {
  constructor(props){
    super(props);
    this.state={
      molblock: '',
      removeHs: true,
      open: false,
    };

    this.openDialog = this.openDialog.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { removeHs, molblock, initialized } = this.props;
    if (prevProps.initialized === false && initialized === true)
      this.setState({ removeHs, molblock });
  }

  openDialog = () => this.setState({
    open: true,
    removeHs: this.props.removeHs,
    molblock: this.props.molblock
  });

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleClose = () => {
    this.setState({ open: false });
    this.props.onClose();
  }

  handleSubmit = async () => {
    const { molblock, removeHs } = this.state;
    await this.props.onSubmit({molblock, removeHs}, this.props.refetch, this.handleClose);
  }

  render() {
    const { classes, errors } = this.props;
    return (
      <div>
        <Tooltip title="Substructure Search">
          <IconButton style={{ padding: '4px' }} aria-label="Search substructure matches" onClick={this.openDialog}>
            <SubstructureIcon />
          </IconButton>
        </Tooltip>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
          disableBackdropClick
          fullWidth
          maxWidth="sm"
        >
          <DialogContent>
            <StructureEditor
              onChange={
                (molblock) => this.handleChange({ target: { name: 'molblock', value: molblock }})
              }
              molblock={this.state.molblock}/>
            {
              errors.substructure ? (
                <Typography color="error" variant="subtitle1">
                  {errors.substructure}
                </Typography>
              ) : null
            }
          </DialogContent>
          <DialogActions style={{ marginRight: '24px', marginLeft: '24px'}}>
            <Grid container alignItems="center">
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!this.state.removeHs}
                      onChange={e=>this.setState({ removeHs: !e.target.checked })}
                    />
                  }
                  label="Include explicit Hs"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems="center" justify="flex-end">
                  <Grid item>
                    <Button onClick={this.handleClose} className={classes.button} variant="contained" color="secondary">
                      Cancel
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button onClick={this.handleSubmit} className={classes.button} variant="contained" color="primary">
                      Search
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

SubstructureSearch.propTypes = {
  classes: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  removeHs: PropTypes.bool.isRequired,
  molblock:PropTypes.string.isRequired,
  initialized:PropTypes.bool.isRequired,
  refetch: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  errors: PropTypes.object
};

export default withStyles(styles)(SubstructureSearch);
