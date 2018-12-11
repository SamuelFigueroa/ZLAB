import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';
import GET_CONTAINER_HINTS from '../../graphql/containers/getContainerHints';

import ADD_CONTAINER from '../../graphql/containers/addContainer';
import GET_COMPOUND from '../../graphql/compounds/getCompound';

class AddContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={ADD_CONTAINER}
            awaitRefetchQueries={true}
            onError={ errorObj => handleError(errorObj) }
          >
            { addContainer => {
              const callMutation = input => addContainer({
                variables: { input },
                refetchQueries: () => [
                  { query: GET_COMPOUND, variables: { id: input.content } },
                  { query: GET_CONTAINER_HINTS }
                ]
              });
              return this.props.children(callMutation, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

AddContainer.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired,
};

export default withRouter(AddContainer);
