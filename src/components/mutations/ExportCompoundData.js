import React, { Component } from 'react';
import PropTypes from 'prop-types';

import EXPORT_COMPOUND_DATA from '../../graphql/compounds/exportCompoundData';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

class ExportCompoundData extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={EXPORT_COMPOUND_DATA}
            onError={ errorObj => handleError(errorObj) }
          >
            { mutate => {
              const exportCompoundData = input => mutate({
                variables: { input }
              });
              return this.props.children(exportCompoundData, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

ExportCompoundData.propTypes = {
  children: PropTypes.func.isRequired,
};

export default ExportCompoundData;
