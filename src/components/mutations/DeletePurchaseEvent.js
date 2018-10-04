import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import DELETE_PURCHASE_EVENT from '../../graphql/assets/deletePurchaseEvent';
import GET_ASSET from '../../graphql/assets/getAsset';

class DeletePurchaseEvent extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={DELETE_PURCHASE_EVENT}
            awaitRefetchQueries={true}
            onError={ errorObj => handleError(errorObj) }
          >
            { deletePurchaseEvent => {
              const callMutation = assetID => ids => deletePurchaseEvent({
                variables: { ids, assetID },
                refetchQueries:() => [{query: GET_ASSET, variables: { id: assetID }}]
              });
              return this.props.children(callMutation, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

DeletePurchaseEvent.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(DeletePurchaseEvent);
