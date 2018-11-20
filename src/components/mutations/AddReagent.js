import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import ADD_REAGENT from '../../graphql/reagents/addReagent';
import GET_REAGENTS from '../../graphql/reagents/getReagents';
import GET_REAGENT_HINTS from '../../graphql/reagents/getReagentHints';

class AddReagent extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={ADD_REAGENT}
            awaitRefetchQueries={true}
            onCompleted={ ({ addReagent:id }) => this.props.history.push(`/chemistry/reagents/${id}`) }
            onError={ errorObj => handleError(errorObj) }
          >
            { addReagent => {
              const callMutation = (input) => addReagent({ variables: { input },
                refetchQueries: () => [
                  { query: GET_REAGENTS },
                  { query: GET_REAGENT_HINTS }
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

AddReagent.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(AddReagent);
