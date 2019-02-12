import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';
import GET_LOCATIONS from '../../graphql/locations/getLocations';

import UPDATE_LOCATION from '../../graphql/locations/updateLocation';

class UpdateLocation extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={UPDATE_LOCATION}
            awaitRefetchQueries={true}
            onError={ errorObj => handleError(errorObj) }
          >
            { updateLocation => {
              const callMutation = input => updateLocation({ variables: { input },
                refetchQueries:() => [
                  { query: GET_LOCATIONS },
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

UpdateLocation.propTypes = {
  children: PropTypes.func.isRequired
};

export default UpdateLocation;
