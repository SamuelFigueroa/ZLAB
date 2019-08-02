import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProgressIndicator from '../ProgressIndicator';

import GET_CONTAINER_COLLECTION from '../../graphql/containerCollections/getContainerCollection';

import { Query } from 'react-apollo';

class GetContainerCollection extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { id } = this.props;
    return(
      <Query query={GET_CONTAINER_COLLECTION} variables={{ id }}>
        { ({ data, loading, error, refetch }) => {
          if (loading) return <ProgressIndicator />;
          if (error) return `Error!: ${error}`;

          const { containerCollection } = data;

          return this.props.children(containerCollection, refetch);
        }}
      </Query>
    );
  }
}

GetContainerCollection.propTypes = {
  children: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired
};

export default GetContainerCollection;
