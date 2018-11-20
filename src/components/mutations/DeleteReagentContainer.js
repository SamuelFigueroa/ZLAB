import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import DELETE_REAGENT_CONTAINER from '../../graphql/reagents/deleteReagentContainer';
import GET_REAGENT from '../../graphql/reagents/getReagent';

class DeleteReagentContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={DELETE_REAGENT_CONTAINER}
            awaitRefetchQueries={true}
            onCompleted={ ({ deleteReagentContainer }) => deleteReagentContainer && this.props.history.push('/chemistry/all#reagents') }
            onError={ errorObj => handleError(errorObj) }
          >
            { deleteReagentContainer => {
              const callMutation = reagentID => ids => deleteReagentContainer({
                variables: { ids, reagentID },
                refetchQueries:() => [{query: GET_REAGENT, variables: { id: reagentID }}]
              });
              return this.props.children(callMutation, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

DeleteReagentContainer.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(DeleteReagentContainer);
