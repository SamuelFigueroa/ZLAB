import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProgressIndicator from '../ProgressIndicator';

import GET_CONTAINER_COLLECTIONS from '../../graphql/containerCollections/getContainerCollections';

import { Query } from 'react-apollo';

class GetContainerCollections extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Query query={GET_CONTAINER_COLLECTIONS} fetchPolicy="network-only">
        { ({ data, loading, error }) => {
          if (loading) return <ProgressIndicator />;
          if (error) return `Error!: ${error}`;

          const { containerCollections } = data;

          return this.props.children(containerCollections.map(collection => ({
            ...collection,
            createdAt: new Date(collection.createdAt).toLocaleDateString('en-US'),
            updatedAt: new Date(collection.updatedAt).toLocaleDateString('en-US'),
          })));
        }}
      </Query>
    );
  }
}

GetContainerCollections.propTypes = {
  children: PropTypes.func.isRequired
};

export default GetContainerCollections;
