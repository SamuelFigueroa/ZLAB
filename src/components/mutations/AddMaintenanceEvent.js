import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';
import GET_ASSET_HINTS from '../../graphql/assets/getAssetHints';

import ADD_MAINTENANCE_EVENT from '../../graphql/assets/addMaintenanceEvent';
import GET_ASSET from '../../graphql/assets/getAsset';

class AddMaintenanceEvent extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={ADD_MAINTENANCE_EVENT}
            awaitRefetchQueries={true}
            onError={ errorObj => handleError(errorObj) }
          >
            { addMaintenanceEvent => {
              const callMutation = (input) => addMaintenanceEvent({
                variables: { input },
                refetchQueries:() => [
                  { query: GET_ASSET, variables: { id: input.assetID } },
                  { query: GET_ASSET_HINTS, variables: { category: 'Lab Equipment' } }
                ]
              });
              return this.props.children(callMutation, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

AddMaintenanceEvent.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired,
};

export default withRouter(AddMaintenanceEvent);
