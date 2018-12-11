import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import ADD_COMPOUND from '../../graphql/compounds/addCompound';
import GET_COMPOUNDS from '../../graphql/compounds/getCompounds';
import GET_COMPOUND_HINTS from '../../graphql/compounds/getCompoundHints';
import GET_CONTAINER_HINTS from '../../graphql/containers/getContainerHints';
import GET_COMPOUND from '../../graphql/compounds/getCompound';

class AddCompound extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={ADD_COMPOUND}
            awaitRefetchQueries={true}
            onCompleted={ ({ addCompound: id }) => this.props.history.push(`/chemistry/compounds/${id}#containers`) }
            onError={ errorObj => handleError(errorObj) }
          >
            { addCompound => {
              const callMutation = (input) => addCompound({ variables: { input },
                refetchQueries: ({ data }) => [
                  { query: GET_COMPOUNDS },
                  { query: GET_COMPOUND_HINTS },
                  { query: GET_CONTAINER_HINTS },
                  { query: GET_COMPOUND, variables: { id: data.addCompound } },
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

AddCompound.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(AddCompound);
