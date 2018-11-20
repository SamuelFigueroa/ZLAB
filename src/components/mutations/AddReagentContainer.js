import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';
import GET_REAGENT_HINTS from '../../graphql/reagents/getReagentHints';

import ADD_REAGENT_CONTAINER from '../../graphql/reagents/addReagentContainer';
import GET_REAGENT from '../../graphql/reagents/getReagent';

class AddReagentContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={ADD_REAGENT_CONTAINER}
            awaitRefetchQueries={true}
            onError={ errorObj => handleError(errorObj) }
          >
            { addReagentContainer => {
              const callMutation = input => addReagentContainer({
                variables: { input },
                refetchQueries: () => [
                  { query: GET_REAGENT, variables: { id: input.reagentID } },
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

AddReagentContainer.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired,
};

export default withRouter(AddReagentContainer);
