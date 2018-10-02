import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import ADD_PRINTER from '../../graphql/printers/addPrinter';

class AddPrinter extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors) => (
          <Mutation
            mutation={ADD_PRINTER}
            onError={ errorObj => handleError(errorObj) }
          >
            { addPrinter => {
              const callMutation = (input) => addPrinter({ variables: { input } });
              return this.props.children(callMutation, errors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

AddPrinter.propTypes = {
  children: PropTypes.func.isRequired
};

export default AddPrinter;
