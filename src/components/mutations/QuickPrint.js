import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import QUICK_PRINT from '../../graphql/printers/quickPrint';

class QuickPrint extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={QUICK_PRINT}
            onError={ errorObj => handleError(errorObj) }
          >
            { quickPrint => {
              const callMutation = input => quickPrint({ variables: { input } });
              return this.props.children(callMutation, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

QuickPrint.propTypes = {
  children: PropTypes.func.isRequired
};

export default QuickPrint;
