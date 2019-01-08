import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';
import RESUSPEND_CONTAINER from '../../graphql/transfers/resuspendContainer';

class ResuspendContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={RESUSPEND_CONTAINER}
            onError={ errorObj => handleError(errorObj) }
          >
            { resuspendContainer => {
              const callMutation = input => resuspendContainer({
                variables: { input }
              });
              return this.props.children(callMutation, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

ResuspendContainer.propTypes = {
  children: PropTypes.func.isRequired,
};

export default ResuspendContainer;
