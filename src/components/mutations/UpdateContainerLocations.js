import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import UPDATE_CONTAINER_LOCATIONS from '../../graphql/containers/updateContainerLocations';

class UpdateContainerLocations extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={UPDATE_CONTAINER_LOCATIONS}
            onError={ errorObj => handleError(errorObj) }
          >
            { updateContainerLocations => {
              const callMutation = (ids, area, sub_area) => updateContainerLocations({
                variables: { ids, area, sub_area },
              });
              return this.props.children(callMutation, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

UpdateContainerLocations.propTypes = {
  children: PropTypes.func.isRequired,
};

export default UpdateContainerLocations;
