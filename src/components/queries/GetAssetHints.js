import React, { Component } from 'react';
import PropTypes from 'prop-types';

import GET_ASSET_HINTS from '../../graphql/assets/getAssetHints';

import { Query } from 'react-apollo';

class GetAssetHints extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { category } = this.props;
    return(
      <Query query={GET_ASSET_HINTS} variables={{ category }}>
        { ({ data, loading, error }) => {
          if (loading) return null;
          if (error) return error;

          const { assetHints } = data;
          return this.props.children(assetHints);
        }}
      </Query>
    );
  }
}

GetAssetHints.propTypes = {
  children: PropTypes.func.isRequired,
  category: PropTypes.string.isRequired
};

export default GetAssetHints;
