import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import ADD_CONTAINER_COLLECTION from '../../graphql/containerCollections/addContainerCollection';
import VALIDATE_UPLOAD from '../../graphql/documents/validateUpload';
import GET_CONTAINER_COLLECTIONS from '../../graphql/containerCollections/getContainerCollections';

class AddContainerCollection extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={VALIDATE_UPLOAD}
            onError={ errorObj => handleError(errorObj)}
          >
            { validateUpload => (
              <Mutation
                mutation={ADD_CONTAINER_COLLECTION}
                onError={ errorObj => handleError(errorObj)}
                update={(cache, { data: { addContainerCollection: collection } }) => {
                  const { containerCollections } = cache.readQuery({ query: GET_CONTAINER_COLLECTIONS });
                  cache.writeQuery({
                    query: GET_CONTAINER_COLLECTIONS,
                    data: { containerCollections: containerCollections.concat([collection]) },
                  });
                }}
              >
                { addContainerCollection => {
                  const validateInput = input => validateUpload({ variables: { input }});
                  const callMutation = input => addContainerCollection(
                    { variables: { input } });
                  return this.props.children(callMutation, validateInput, errors, clearErrors);
                }}
              </Mutation>
            )}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

AddContainerCollection.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(AddContainerCollection);
