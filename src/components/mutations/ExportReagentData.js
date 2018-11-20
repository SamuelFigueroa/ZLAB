import React, { Component } from 'react';
import PropTypes from 'prop-types';

import EXPORT_REAGENT_DATA from '../../graphql/reagents/exportReagentData';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

class ExportReagentData extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={EXPORT_REAGENT_DATA}
            onError={ errorObj => handleError(errorObj) }
          >
            { mutate => {
              const exportReagentData = input => mutate({
                variables: { input }
              });
              return this.props.children(exportReagentData, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

ExportReagentData.propTypes = {
  children: PropTypes.func.isRequired,
};

export default ExportReagentData;
