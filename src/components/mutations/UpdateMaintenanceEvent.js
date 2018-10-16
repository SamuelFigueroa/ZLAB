import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';
import GET_ASSET_HINTS from '../../graphql/assets/getAssetHints';

import UPDATE_MAINTENANCE_EVENT from '../../graphql/assets/updateMaintenanceEvent';
import GET_ASSET from '../../graphql/assets/getAsset';

class UpdateMaintenanceEvent extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={UPDATE_MAINTENANCE_EVENT}
            awaitRefetchQueries={true}
            onError={ errorObj => handleError(errorObj) }
          >
            { updateMaintenanceEvent => {
              const callMutation = (input) => updateMaintenanceEvent({ variables: { input },
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

UpdateMaintenanceEvent.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(UpdateMaintenanceEvent);
