import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import UNQUEUE_CONTAINER_COLLECTION from '../../graphql/containerCollections/unqueueContainerCollection';
import GET_CONTAINER_COLLECTIONS from '../../graphql/containerCollections/getContainerCollections';

class UnqueueContainerCollection extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { handleError => (
          <Mutation
            mutation={UNQUEUE_CONTAINER_COLLECTION}
            onError={ errorObj => handleError(errorObj) }
            awaitRefetchQueries={true}
          >
            { unqueueContainerCollection => {
              const callMutation = ids => unqueueContainerCollection({
                variables: { ids },
                refetchQueries:() => [{ query: GET_CONTAINER_COLLECTIONS }]
              });
              return this.props.children(callMutation);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

UnqueueContainerCollection.propTypes = {
  children: PropTypes.func.isRequired,
};

export default UnqueueContainerCollection;
