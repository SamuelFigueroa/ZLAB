import React, { Component } from 'react';
import PropTypes from 'prop-types';

import EXPORT_REGISTRATION_TEMPLATE from '../../graphql/containerCollections/exportRegistrationTemplate';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

class ExportRegistrationTemplate extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={EXPORT_REGISTRATION_TEMPLATE}
            onError={ errorObj => handleError(errorObj) }
          >
            { mutate => {
              const exportRegistrationTemplate = async () => {
                let response = await mutate();
                let fileURL = response !== undefined ? response.data.exportRegistrationTemplate : null;
                return fileURL;
              };

              return this.props.children(exportRegistrationTemplate, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

ExportRegistrationTemplate.propTypes = {
  children: PropTypes.func.isRequired,
};

export default ExportRegistrationTemplate;
