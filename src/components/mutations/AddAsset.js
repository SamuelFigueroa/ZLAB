import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import ADD_ASSET from '../../graphql/assets/addAsset';
import GET_ASSETS from '../../graphql/assets/getAssets';
import GET_ASSET_HINTS from '../../graphql/assets/getAssetHints';

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
            awaitRefetchQueries={true}
            onCompleted={ () => this.props.history.goBack() }
            onError={ errorObj => handleError(errorObj) }
          >
            { addAsset => {
              const callMutation = (input) => addAsset({ variables: { input },
                refetchQueries: () => [
                  { query: GET_ASSETS, variables: { input: { category: input.category } } },
                  { query: GET_ASSET_HINTS, variables: { category: input.category } }
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

AddAsset.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(AddAsset);
