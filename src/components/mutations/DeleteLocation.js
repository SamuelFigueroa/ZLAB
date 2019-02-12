import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import DELETE_LOCATION from '../../graphql/locations/deleteLocation';
import GET_LOCATIONS from '../../graphql/locations/getLocations';

class DeleteLocation extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={DELETE_LOCATION}
            awaitRefetchQueries={true}
            onError={ errorObj => handleError(errorObj) }
          >
            { deleteLocation => {
              const callMutation = input => deleteLocation({
                variables: { input },
                refetchQueries:() => [{ query: GET_LOCATIONS }]
              });
              return this.props.children(callMutation, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

DeleteLocation.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(DeleteLocation);
