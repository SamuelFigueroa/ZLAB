import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import UPDATE_CONTAINER from '../../graphql/containers/updateContainer';
import GET_COMPOUND from '../../graphql/compounds/getCompound';
import GET_CONTAINER_HINTS from '../../graphql/containers/getContainerHints';

class UpdateContainer extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={UPDATE_CONTAINER}
            awaitRefetchQueries={true}
            onError={ errorObj => handleError(errorObj) }
          >
            { updateContainer => {
              const callMutation = (input) => updateContainer({ variables: { input },
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

UpdateContainer.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(UpdateContainer);
