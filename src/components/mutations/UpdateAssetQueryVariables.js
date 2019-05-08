import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';

import UPDATE_ASSET_QUERY_VARS from '../../graphql/assets/updateAssetQueryVariables';

class UpdateAssetQueryVariables extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { id } = this.props;
    return(
      <Mutation
        mutation={UPDATE_ASSET_QUERY_VARS}
      >
        { updateAssetQueryVariables => {
          const callMutation = input => updateAssetQueryVariables({ variables: { input: { id, ...input } } });
          return this.props.children(callMutation);
        }}
      </Mutation>
    );
  }
}

UpdateAssetQueryVariables.propTypes = {
  children: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired
};

export default UpdateAssetQueryVariables;
