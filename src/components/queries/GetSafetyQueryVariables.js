import React, { Component } from 'react';
import PropTypes from 'prop-types';

import GET_SAFETY_QUERY_VARS from '../../graphql/safety/getSafetyQueryVariables';

import { Query } from 'react-apollo';

class GetSafetyQueryVariables extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { id } = this.props;
    return(
      <Query query={GET_SAFETY_QUERY_VARS} variables={{ id }}>
        { ({ data, loading, error }) => {
          if (loading) return null;
          if (error) return `Error!: ${error}`;

          const { safetyQueryVariables } = data;
          return this.props.children(safetyQueryVariables);
        }}
      </Query>
    );
  }
}

GetSafetyQueryVariables.propTypes = {
  children: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired
};

export default GetSafetyQueryVariables;
