import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';
import ArrowIcon from '@material-ui/icons/ArrowDownward';


const styles = (theme) => ({
  arrow: {
    color: theme.palette.text.secondary,
    fontSize: theme.typography.h6.fontSize
  },
  actions: {
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3
  },
  paper: {
    overflowY: 'visible'
  }
});

class NormalizationDialog extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes, theme, open, unregisteredValue, currentValue, inputComponent, onReset, onClose, onSave } = this.props;
    return(
      <Dialog
        onClose={onClose}
        open={open}
        classes={{ paper: classes.paper }}>
        <DialogTitle>Normalize Field</DialogTitle>
        <DialogContent style={{ overflowY: 'visible' }}>
          <DialogContentText>
            If the <span style={{ color: theme.palette.primary.main }}>unrecognized</span> value has been registered previously under a different name,
            please select the correctly named value to replace all occurrences in the collection.
          </DialogContentText>
          <Grid container direction="column" justify="center" alignItems="center">
            <Grid item>
              <Typography variant="subtitle1" color="primary">
                {unregisteredValue}
              </Typography>
            </Grid>
            <Grid item>
              <ArrowIcon className={classes.arrow}/>
            </Grid>
          </Grid>
          {inputComponent}
        </DialogContent>
        <DialogActions className={classes.actions}>
          <Grid container justify="space-between" alignItems="center">
            <Grid item>
              <Button
                onClick={onReset}>
                Reset
              </Button>
            </Grid>
            <Grid item>
              <Grid container justify="center" alignItems="center">
                <Grid item>
                  <Button onClick={onClose} color="secondary">
                    Cancel
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    color="primary"
                    disabled={currentValue === null}
                    onClick={onSave}>
                    Save
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
    );
  }
}

NormalizationDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  unregisteredValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
  currentValue: PropTypes.array,
  inputComponent: PropTypes.object.isRequired,
  onReset: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default withStyles(styles, { withTheme: true })(NormalizationDialog);
