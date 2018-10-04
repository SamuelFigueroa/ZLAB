import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import DELETE_ASSET from '../../graphql/assets/deleteAsset';
import GET_ASSETS from '../../graphql/assets/getAssets';

class DeleteAsset extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError) => (
          <Mutation
            mutation={DELETE_ASSET}
            awaitRefetchQueries={true}
            onCompleted={ () => this.props.history.push('/assets') }
            onError={ errorObj => handleError(errorObj) }
          >
            { deleteAsset => {
              const callMutation = (id, category) => deleteAsset({
                variables: { id },
                refetchQueries: () => [ { query: GET_ASSETS, variables: { category } } ]
              });
              return this.props.children(callMutation);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

DeleteAsset.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(DeleteAsset);
