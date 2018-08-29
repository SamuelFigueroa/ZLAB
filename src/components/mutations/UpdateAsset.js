import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import UPDATE_ASSET from '../../graphql/assets/updateAsset';
import GET_ASSET from '../../graphql/assets/getAsset';

class UpdateAsset extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={UPDATE_ASSET}
            awaitRefetchQueries={true}
            onCompleted={ () => this.props.history.goBack() }
            onError={ errorObj => handleError(errorObj) }
          >
            { updateAsset => {
              const callMutation = (input) => updateAsset({ variables: { input },
                refetchQueries:() => [{query: GET_ASSET, variables: { id: input.id }}]
              });
              return this.props.children(callMutation, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

UpdateAsset.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(UpdateAsset);
