import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import DELETE_CONTAINER_COLLECTION from '../../graphql/containerCollections/deleteContainerCollection';
import GET_CONTAINER_COLLECTIONS from '../../graphql/containerCollections/getContainerCollections';

class DeleteContainerCollection extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { handleError => (
          <Mutation
            mutation={DELETE_CONTAINER_COLLECTION}
            onError={ errorObj => handleError(errorObj) }
            update={(cache, { data: { deleteContainerCollection } }) => {
              if(deleteContainerCollection) {
                const deleted = new Set(deleteContainerCollection);
                const { containerCollections } = cache.readQuery({ query: GET_CONTAINER_COLLECTIONS });
                cache.writeQuery({
                  query: GET_CONTAINER_COLLECTIONS,
                  data: { containerCollections: containerCollections.filter(c=>!deleted.has(c.id)) },
                });
              }
            }}
          >
            { deleteContainerCollection => {
              const callMutation = ids => deleteContainerCollection({
                variables: { ids },
              });
              return this.props.children(callMutation);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

DeleteContainerCollection.propTypes = {
  children: PropTypes.func.isRequired,
};

export default DeleteContainerCollection;
