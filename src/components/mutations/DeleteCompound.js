import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import DELETE_COMPOUND from '../../graphql/compounds/deleteCompound';
// import GET_COMPOUND_INVENTORY from '../../graphql/compounds/getCompoundInventory';

class DeleteCompound extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { handleError => (
          <Mutation
            mutation={DELETE_COMPOUND}
            awaitRefetchQueries={true}
            onCompleted={ () => this.props.history.push('/chemistry/all#compounds') }
            onError={ errorObj => handleError(errorObj) }
          >
            { deleteCompound => {
              const callMutation = id => deleteCompound({
                variables: { id },
                // refetchQueries: () => [ { query: GET_COMPOUND_INVENTORY, variables: { first: 25 } } ]
              });
              return this.props.children(callMutation);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

DeleteCompound.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(DeleteCompound);
