import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import DELETE_CONTAINER from '../../graphql/containers/deleteContainer';
// import GET_CONTAINER_INVENTORY from '../../graphql/containers/getContainerInventory';

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
                // refetchQueries: () => [ { query: GET_CONTAINER_INVENTORY, variables: { filter: { }, search: null, first: 25 } } ]
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
