import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import DELETE_CONTAINER from '../../graphql/containers/deleteContainer';
import GET_CONTAINERS from '../../graphql/containers/getContainers';

class DeleteContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError) => (
          <Mutation
            mutation={DELETE_CONTAINER}
            awaitRefetchQueries={true}
            onCompleted={ () => this.props.history.push('/chemistry/all#containers') }
            onError={ errorObj => handleError(errorObj) }
          >
            { deleteContainer => {
              const callMutation = id => deleteContainer({
                variables: { id },
                refetchQueries: () => [ { query: GET_CONTAINERS, variables: { filter: { }, search: null } } ]
              });
              return this.props.children(callMutation);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

DeleteContainer.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(DeleteContainer);
