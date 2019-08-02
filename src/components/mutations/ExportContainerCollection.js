import React, { Component } from 'react';
import PropTypes from 'prop-types';

import EXPORT_CONTAINER_COLLECTION from '../../graphql/containerCollections/exportContainerCollection';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

class ExportContainerCollection extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={EXPORT_CONTAINER_COLLECTION}
            onError={ errorObj => handleError(errorObj) }
          >
            { mutate => {
              const exportContainerCollection = async id => {
                let response = await mutate({
                  variables: { id }
                });
                let fileURL = response !== undefined ? response.data.exportContainerCollection : null;
                return fileURL;
              };

              return this.props.children(exportContainerCollection, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

ExportContainerCollection.propTypes = {
  children: PropTypes.func.isRequired,
};

export default ExportContainerCollection;
