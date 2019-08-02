import React, { Component } from 'react';
import PropTypes from 'prop-types';

import GET_LOCATION_NORMALIZATION from '../../graphql/containerCollections/getLocationNormalization';

import { Query } from 'react-apollo';

class GetLocationNormalization extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { collectionID } = this.props;
    return(
      <Query query={GET_LOCATION_NORMALIZATION} variables={{ collectionID }}>
        { ({ data, loading, error }) => {
          if (loading) return null;
          if (error) return `Error!: ${error}`;

          const { locationNormalization } = data;

          return this.props.children(locationNormalization, loading);
        }}
      </Query>
    );
  }
}

GetLocationNormalization.propTypes = {
  children: PropTypes.func.isRequired,
  collectionID: PropTypes.string.isRequired
};

export default GetLocationNormalization;
