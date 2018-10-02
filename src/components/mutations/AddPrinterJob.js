import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import ADD_PRINTER_JOB from '../../graphql/printers/addPrinterJob';

class AddPrinterJob extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors) => (
          <Mutation
            mutation={ADD_PRINTER_JOB}
            onError={ errorObj => handleError(errorObj) }
          >
            { addPrinterJob => {
              const callMutation = input => addPrinterJob({ variables: { input } });
              return this.props.children(callMutation, errors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

AddPrinterJob.propTypes = {
  children: PropTypes.func.isRequired
};

export default AddPrinterJob;
