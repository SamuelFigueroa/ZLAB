import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import DELETE_DOCUMENT from '../../graphql/documents/deleteDocument';
import GET_ASSET from '../../graphql/assets/getAsset';

class DeleteDocument extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError) => (
          <Mutation
            mutation={DELETE_DOCUMENT}
            awaitRefetchQueries={true}
            onError={ errorObj => handleError(errorObj) }
          >
            { deleteDocument => {
              const callMutation = assetID => ids => deleteDocument({
                variables: { ids, assetID },
                refetchQueries:() => [{query: GET_ASSET, variables: { id: assetID }}]
              });
              return this.props.children(callMutation);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

DeleteDocument.propTypes = {
  children: PropTypes.func.isRequired
};

export default DeleteDocument;
