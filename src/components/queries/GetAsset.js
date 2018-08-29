import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LinearProgress from '@material-ui/core/LinearProgress';

import GET_ASSET from '../../graphql/assets/getAsset';

import { Query } from 'react-apollo';

class GetAsset extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { id } = this.props;
    return(
      <Query query={GET_ASSET} variables={{ id }}>
        { ({ data, loading, error }) => {
          if (loading) return <LinearProgress />;
          if (error) return `Error!: ${error}`;

          const { asset } = data;
          return this.props.children(asset);
        }}
      </Query>
    );
  }
}

GetAsset.propTypes = {
  children: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired
};

export default GetAsset;
