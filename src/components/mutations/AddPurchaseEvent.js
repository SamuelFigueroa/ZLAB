import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import ADD_PURCHASE_EVENT from '../../graphql/assets/addPurchaseEvent';
import GET_ASSET from '../../graphql/assets/getAsset';

class AddPurchaseEvent extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={ADD_PURCHASE_EVENT}
            awaitRefetchQueries={true}
            onError={ errorObj => handleError(errorObj) }
          >
            { addPurchaseEvent => {
              const callMutation = (input) => addPurchaseEvent({
                variables: { input },
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

AddPurchaseEvent.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired,
};

export default withRouter(AddPurchaseEvent);
