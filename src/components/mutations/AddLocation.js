import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import ADD_LOCATION from '../../graphql/locations/addLocation';
import GET_LOCATIONS from '../../graphql/locations/getLocations';

class AddLocation extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={ADD_LOCATION}
            awaitRefetchQueries={true}
            onError={ errorObj => handleError(errorObj) }
          >
            { addLocation => {
              const callMutation = input => addLocation({ variables: { input },
                refetchQueries: () => [
                  { query: GET_LOCATIONS }
                ]});
              return this.props.children(callMutation, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

AddLocation.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(AddLocation);
