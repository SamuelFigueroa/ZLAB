import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import DELETE_PRINTER_JOB from '../../graphql/printers/deletePrinterJob';

class DeletePrinterJob extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors) => (
          <Mutation
            mutation={DELETE_PRINTER_JOB}
            onError={ errorObj => handleError(errorObj) }
          >
            { deletePrinterJob => {
              const callMutation = input => deletePrinterJob({ variables: { input } });
              return this.props.children(callMutation, errors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

DeletePrinterJob.propTypes = {
  children: PropTypes.func.isRequired
};

export default DeletePrinterJob;
