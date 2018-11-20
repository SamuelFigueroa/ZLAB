import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import UPDATE_REAGENT from '../../graphql/reagents/updateReagent';
import GET_REAGENT from '../../graphql/reagents/getReagent';
import GET_REAGENT_HINTS from '../../graphql/reagents/getReagentHints';

class UpdateReagent extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={UPDATE_REAGENT}
            awaitRefetchQueries={true}
            onCompleted={ () => this.props.history.goBack() }
            onError={ errorObj => handleError(errorObj) }
          >
            { updateReagent => {
              const callMutation = (input) => updateReagent({ variables: { input },
                refetchQueries:() => [
                  { query: GET_REAGENT, variables: { id: input.id } },
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

UpdateReagent.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(UpdateReagent);
