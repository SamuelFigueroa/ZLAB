import React, { Component } from 'react';
import PropTypes from 'prop-types';

import GET_CONTAINER_NORMALIZATION from '../../graphql/containerCollections/getContainerNormalization';

import { Query } from 'react-apollo';

class GetContainerNormalization extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { collectionID } = this.props;
    return(
      <Query query={GET_CONTAINER_NORMALIZATION} variables={{ collectionID }}>
        { ({ data, loading, error }) => {
          if (loading) return null;
          if (error) return `Error!: ${error}`;

          const { containerNormalization } = data;

          return this.props.children(containerNormalization, loading);
        }}
      </Query>
    );
  }
}

GetContainerNormalization.propTypes = {
  children: PropTypes.func.isRequired,
  collectionID: PropTypes.string.isRequired
};

export default GetContainerNormalization;
