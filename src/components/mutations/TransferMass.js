import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';
import TRANSFER_MASS from '../../graphql/transfers/transferMass';

class TransferMass extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={TRANSFER_MASS}
            onError={ errorObj => handleError(errorObj) }
          >
            { transferMass => {
              const callMutation = input => transferMass({
                variables: { input }
              });
              return this.props.children(callMutation, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

TransferMass.propTypes = {
  children: PropTypes.func.isRequired,
};

export default TransferMass;
