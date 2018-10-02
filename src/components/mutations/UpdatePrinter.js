import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import UPDATE_PRINTER from '../../graphql/printers/updatePrinter';

class UpdatePrinter extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors) => (
          <Mutation
            mutation={UPDATE_PRINTER}
            onError={ errorObj => handleError(errorObj) }
          >
            { updatePrinter => {
              const callMutation = input => updatePrinter({ variables: { input } });
              return this.props.children(callMutation, errors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

UpdatePrinter.propTypes = {
  children: PropTypes.func.isRequired
};

export default UpdatePrinter;
