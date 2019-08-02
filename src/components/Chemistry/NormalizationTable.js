import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Table from '../Table';
import Toolbar from '../TableToolbar';
import NormalizationDialog from './NormalizationDialog';

class NormalizationTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentValue: null,
      currentField: null,
      unregisteredValue: null,
      selectedEntryID: null
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleChange = event => {
    return this.setState({ currentValue : [event] });
  }

  handleClose = () => this.setState({ currentField: null, currentValue: null, unregisteredValue: null, selectedEntryID: null });

  handleRowClick = onRowClick => id => () => {
    const { selectedEntryID, currentField, unregisteredValue } = onRowClick(id);
    this.setState({ selectedEntryID, currentField, unregisteredValue });
  }

  render() {
    const { cols, data, title, inputComponent: InputComponent, onRowClick, onReset, onSave } = this.props;
    const { currentField, currentValue, unregisteredValue } = this.state;
    return (
      <div>
        { currentField !== null ? (
          <NormalizationDialog
            open={currentField !== null}
            unregisteredValue={unregisteredValue}
            currentValue={currentValue}
            inputComponent={
              <InputComponent
                field={currentField}
                value={currentValue}
                onChange={this.handleChange}
              />
            }
            onReset={() => {
              onReset(this.state);
              this.handleClose();
            }}
            onClose={this.handleClose}
            onSave={() => {
              onSave(this.state);
              this.handleClose();
            }}
          />
        ) : null }
        <Table
          cols={cols}
          data={data}
          toolbar={<Toolbar title={title} />}
          onRowClick={this.handleRowClick(onRowClick)}
          rowsPerPage={5}
        />
      </div>
    );
  }
}

NormalizationTable.propTypes = {
  cols: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  inputComponent: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onRowClick:  PropTypes.func.isRequired,
};

export default NormalizationTable;
