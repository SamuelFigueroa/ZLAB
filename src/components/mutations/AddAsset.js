import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import ADD_ASSET from '../../graphql/assets/addAsset';
import GET_ASSETS from '../../graphql/assets/getAssets';

class AddAsset extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={ADD_ASSET}
            refetchQueries={() => [{query: GET_ASSETS}]}
            awaitRefetchQueries={true}
            onCompleted={ () => this.props.history.push('/assets') }
            onError={ errorObj => handleError(errorObj) }
          >
            { addAsset => {
              const callMutation = (input) => addAsset({ variables: { input } });
              return this.props.children(callMutation, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

AddAsset.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(AddAsset);
