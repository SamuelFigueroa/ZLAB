import React, { Component } from 'react';
import PropTypes from 'prop-types';

import FilterListIcon from '@material-ui/icons/FilterList';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';

import TableFilterDialog from './TableFilterDialog';

const Transition = props => <Slide direction="up" {...props} />;

class TableFilter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
    this.openDialog = this.openDialog.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  openDialog = () => {
    this.setState({ open: true });
  };

  handleClose = onClose => () => {
    this.setState({ open: false });
    onClose();
  };

  render() {
    const { options: FilterOptions, filterOn: on, onClose, ...filterProps } = this.props;
    return (
      <FilterOptions>
        { options => (
          <div>
            <Tooltip title="Filter">
              <IconButton style={{ padding: '4px' }} aria-label="Filter list" onClick={this.openDialog}>
                <FilterListIcon color={on ? 'primary' : 'inherit'}/>
              </IconButton>
            </Tooltip>
            <Dialog
              fullScreen
              open={this.state.open}
              onClose={this.handleClose(onClose)}
              TransitionComponent={Transition}
            >
              <TableFilterDialog
                onClose={this.handleClose(onClose)}
                options={options}
                {...filterProps}
              />
            </Dialog>
          </div>
        )}
      </FilterOptions>
    );
  }
}

TableFilter.propTypes = {
  options: PropTypes.func.isRequired,
  filterOn: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default TableFilter;
