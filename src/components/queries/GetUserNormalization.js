import React, { Component } from 'react';
import PropTypes from 'prop-types';

import GET_USER_NORMALIZATION from '../../graphql/containerCollections/getUserNormalization';

import { Query } from 'react-apollo';

class GetUserNormalization extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { collectionID } = this.props;
    return(
      <Query query={GET_USER_NORMALIZATION} variables={{ collectionID }}>
        { ({ data, loading, error }) => {
          if (loading) return null;
          if (error) return `Error!: ${error}`;

          const { userNormalization } = data;

          return this.props.children(userNormalization, loading);
        }}
      </Query>
    );
  }
}

GetUserNormalization.propTypes = {
  children: PropTypes.func.isRequired,
  collectionID: PropTypes.string.isRequired
};

export default GetUserNormalization;
