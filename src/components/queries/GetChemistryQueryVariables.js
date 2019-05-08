import React, { Component } from 'react';
import PropTypes from 'prop-types';

import GET_CHEMISTRY_QUERY_VARS from '../../graphql/chemistry/getChemistryQueryVariables';

import { Query } from 'react-apollo';

class GetChemistryQueryVariables extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { id } = this.props;
    return(
      <Query query={GET_CHEMISTRY_QUERY_VARS} variables={{ id }}>
        { ({ data, loading, error }) => {
          if (loading) return null;
          if (error) return `Error!: ${error}`;

          const { chemistryQueryVariables } = data;
          return this.props.children(chemistryQueryVariables);
        }}
      </Query>
    );
  }
}

GetChemistryQueryVariables.propTypes = {
  children: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired
};

export default GetChemistryQueryVariables;
