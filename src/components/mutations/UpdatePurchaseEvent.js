import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import UPDATE_PURCHASE_EVENT from '../../graphql/assets/updatePurchaseEvent';
import GET_ASSET from '../../graphql/assets/getAsset';

class UpdatePurchaseEvent extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={UPDATE_PURCHASE_EVENT}
            awaitRefetchQueries={true}
            onError={ errorObj => handleError(errorObj) }
          >
            { updatePurchaseEvent => {
              const callMutation = (input) => updatePurchaseEvent({ variables: { input },
                refetchQueries:() => [{query: GET_ASSET, variables: { id: input.assetID }}]
              });
              return this.props.children(callMutation, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

UpdatePurchaseEvent.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(UpdatePurchaseEvent);
