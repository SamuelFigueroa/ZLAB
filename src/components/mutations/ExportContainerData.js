import React, { Component } from 'react';
import PropTypes from 'prop-types';

import EXPORT_CONTAINER_DATA from '../../graphql/containers/exportContainerData';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

class ExportContainerData extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={EXPORT_CONTAINER_DATA}
            onError={ errorObj => handleError(errorObj) }
          >
            { mutate => {
              const exportContainerData = input => mutate({
                variables: { input }
              });
              return this.props.children(exportContainerData, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

ExportContainerData.propTypes = {
  children: PropTypes.func.isRequired,
};

export default ExportContainerData;
