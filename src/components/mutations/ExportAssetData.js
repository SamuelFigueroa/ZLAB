import React, { Component } from 'react';
import PropTypes from 'prop-types';

import EXPORT_ASSET_DATA from '../../graphql/assets/exportAssetData';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

class ExportAssetData extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={EXPORT_ASSET_DATA}
            onError={ errorObj => handleError(errorObj) }
          >
            { mutate => {
              const exportAssetData = async input => {
                let response = await mutate({
                  variables: { input }
                });
                let fileURL = response !== undefined ? response.data.exportAssetData : null;
                return fileURL;
              };

              return this.props.children(exportAssetData, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

ExportAssetData.propTypes = {
  children: PropTypes.func.isRequired,
};

export default ExportAssetData;
