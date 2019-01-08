import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';
import TRANSFER_VOLUME from '../../graphql/transfers/transferVolume';

class TransferVolume extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={TRANSFER_VOLUME}
            onError={ errorObj => handleError(errorObj) }
          >
            { transferVolume => {
              const callMutation = input => transferVolume({
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

TransferVolume.propTypes = {
  children: PropTypes.func.isRequired,
};

export default TransferVolume;
