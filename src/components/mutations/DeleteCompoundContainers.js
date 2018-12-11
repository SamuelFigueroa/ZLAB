import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import DELETE_COMPOUND_CONTAINERS from '../../graphql/compounds/deleteCompoundContainers';
import GET_COMPOUND from '../../graphql/compounds/getCompound';

class DeleteCompoundContainers extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={DELETE_COMPOUND_CONTAINERS}
            awaitRefetchQueries={true}
            onCompleted={ ({ deleteCompoundContainers }) => deleteCompoundContainers && this.props.history.push('/chemistry/all#compounds') }
            onError={ errorObj => handleError(errorObj) }
          >
            { deleteCompoundContainers => {
              const callMutation = compoundID => ids => deleteCompoundContainers({
                variables: { ids, compoundID },
                refetchQueries:() => [{query: GET_COMPOUND, variables: { id: compoundID }}]
              });
              return this.props.children(callMutation, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

DeleteCompoundContainers.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(DeleteCompoundContainers);
