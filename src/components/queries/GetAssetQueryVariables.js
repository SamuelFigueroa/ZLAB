import React, { Component } from 'react';
import PropTypes from 'prop-types';

import GET_ASSET_QUERY_VARS from '../../graphql/assets/getAssetQueryVariables';

import { Query } from 'react-apollo';

class GetAssetQueryVariables extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { id } = this.props;
    return(
      <Query query={GET_ASSET_QUERY_VARS} variables={{ id }}>
        { ({ data, loading, error }) => {
          if (loading) return null;
          if (error) return `Error!: ${error}`;

          const { assetQueryVariables } = data;
          return this.props.children(assetQueryVariables);
        }}
      </Query>
    );
  }
}

GetAssetQueryVariables.propTypes = {
  children: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired
};

export default GetAssetQueryVariables;
