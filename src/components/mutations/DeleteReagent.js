import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import DELETE_REAGENT from '../../graphql/reagents/deleteReagent';
import GET_REAGENTS from '../../graphql/reagents/getReagents';

class DeleteReagent extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { handleError => (
          <Mutation
            mutation={DELETE_REAGENT}
            awaitRefetchQueries={true}
            onCompleted={ () => this.props.history.push('/chemistry/all#reagents') }
            onError={ errorObj => handleError(errorObj) }
          >
            { deleteReagent => {
              const callMutation = id => deleteReagent({
                variables: { id },
                refetchQueries: () => [ { query: GET_REAGENTS } ]
              });
              return this.props.children(callMutation);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

DeleteReagent.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(DeleteReagent);
