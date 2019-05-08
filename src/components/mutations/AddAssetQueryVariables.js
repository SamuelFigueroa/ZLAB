import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';

import ADD_ASSET_QUERY_VARS from '../../graphql/assets/addAssetQueryVariables';

class AddAssetQueryVariables extends Component {
  constructor(props) {
    super(props);
    this.state = {
      completed: false
    };
  }

  render() {
    const { id } = this.props;
    return(
      <Mutation
        mutation={ADD_ASSET_QUERY_VARS}
        onCompleted={()=>this.setState({ completed: true })}
      >
        { addAssetQueryVariables => {
          const callMutation = async variables => await addAssetQueryVariables({ variables: { input: { id, typename: 'AssetQueryVariables', ...variables } },
          });
          return this.props.children(callMutation, this.state.completed);
        }}
      </Mutation>
    );
  }
}

AddAssetQueryVariables.propTypes = {
  children: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
};

export default AddAssetQueryVariables;
