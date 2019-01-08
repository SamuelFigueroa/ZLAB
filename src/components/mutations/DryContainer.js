import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';
import DRY_CONTAINER from '../../graphql/transfers/dryContainer';

class DryContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={DRY_CONTAINER}
            onError={ errorObj => handleError(errorObj) }
          >
            { dryContainer => {
              const callMutation = input => dryContainer({
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

DryContainer.propTypes = {
  children: PropTypes.func.isRequired,
};

export default DryContainer;
