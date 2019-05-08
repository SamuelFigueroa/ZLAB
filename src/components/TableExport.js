import React, { Component } from 'react';
import PropTypes from 'prop-types';

import FileDownloadIcon from '@material-ui/icons/GetApp';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

class TableExport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      name: ''
    };
    this.openDialog = this.openDialog.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  openDialog = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.props.onClose();
    this.setState({ open: false, name: '' });
  };

  handleChange = e => this.setState({ [e.target.name]: e.target.value });

  handleSubmit = async () => {
    const { onSubmit } = this.props;
    let filename = this.state.name;
    if (filename) {
      if(!filename.endsWith('.csv')) filename=filename.concat('.csv');
    } else {
      filename = 'export.csv';
    }

    let fileURL = await onSubmit(filename);
    if(fileURL) {
      this.handleClose();
      window.open(fileURL);
    }
  }

  render() {
    const { errors } = this.props;
    return (
      <div>
        <Tooltip title="Download">
          <IconButton style={{ padding: '4px' }} aria-label="Download csv file" onClick={this.openDialog}>
            <FileDownloadIcon />
          </IconButton>
        </Tooltip>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Export Data to CSV File</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To download this table, please enter the name of the file.
              The .csv extension will automatically be appended to the name.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="File Name"
              fullWidth
              value={this.state.name}
              onChange={this.handleChange}
              error={Boolean(errors.name)}
              helperText={errors.name}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={async ()=> await this.handleSubmit()} color="primary">
              Download
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

TableExport.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default TableExport;
