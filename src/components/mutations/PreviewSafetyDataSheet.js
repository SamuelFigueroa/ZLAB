import React, { Component } from 'react';
import PropTypes from 'prop-types';

import PREVIEW_SAFETY_DATA_SHEET from '../../graphql/safety/previewSafetyDataSheet';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

class PreviewSafetyDataSheet extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={PREVIEW_SAFETY_DATA_SHEET}
            onCompleted={ ({ previewSafetyDataSheet: url }) => window.open(url, '') }
            onError={ errorObj => handleError(errorObj) }
          >
            { (mutate, { loading }) => {
              const previewSafetyDataSheet = sds_id => mutate({
                variables: { sds_id }
              });
              return this.props.children(previewSafetyDataSheet, loading, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

PreviewSafetyDataSheet.propTypes = {
  children: PropTypes.func.isRequired,
};

export default PreviewSafetyDataSheet;
