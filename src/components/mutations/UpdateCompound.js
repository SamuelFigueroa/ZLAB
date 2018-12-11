import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import UPDATE_COMPOUND from '../../graphql/compounds/updateCompound';
import GET_COMPOUND from '../../graphql/compounds/getCompound';
import GET_COMPOUND_HINTS from '../../graphql/compounds/getCompoundHints';

class UpdateCompound extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={UPDATE_COMPOUND}
            awaitRefetchQueries={true}
            onCompleted={ ({ updateCompound:id }) => this.props.history.push(`/chemistry/compounds/${id}`)}
            onError={ errorObj => handleError(errorObj) }
          >
            { updateCompound => {
              const callMutation = (input) => updateCompound({ variables: { input },
                refetchQueries:() => [
                  { query: GET_COMPOUND, variables: { id: input.id } },
                  { query: GET_COMPOUND_HINTS }
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

UpdateCompound.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(UpdateCompound);
