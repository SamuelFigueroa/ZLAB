import React, { Component } from 'react';
import PropTypes from 'prop-types';

import EXPORT_COMPOUND_SAFETY_DATA from '../../graphql/safety/exportCompoundSafetyData';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

class ExportCompoundSafetyData extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={EXPORT_COMPOUND_SAFETY_DATA}
            onError={ errorObj => handleError(errorObj) }
          >
            { mutate => {
              const exportCompoundSafetyData = input => mutate({
                variables: { input }
              });
              return this.props.children(exportCompoundSafetyData, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

ExportCompoundSafetyData.propTypes = {
  children: PropTypes.func.isRequired,
};

export default ExportCompoundSafetyData;
