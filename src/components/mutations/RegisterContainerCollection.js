import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import REGISTER_CONTAINER_COLLECTION from '../../graphql/containerCollections/registerContainerCollection';

class RegisterContainerCollection extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={REGISTER_CONTAINER_COLLECTION}
            onError={ errorObj => handleError(errorObj) }
          >
            { (registerContainerCollection, { loading }) => {
              const callMutation = input => registerContainerCollection({ variables: { input } });
              return this.props.children(callMutation, loading, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

RegisterContainerCollection.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(RegisterContainerCollection);
