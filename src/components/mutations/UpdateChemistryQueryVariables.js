import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';

import UPDATE_CHEMISTRY_QUERY_VARS from '../../graphql/chemistry/updateChemistryQueryVariables';

class UpdateChemistryQueryVariables extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { id } = this.props;
    return(
      <Mutation
        mutation={UPDATE_CHEMISTRY_QUERY_VARS}
      >
        { updateChemistryQueryVariables => {
          const callMutation = input => updateChemistryQueryVariables({ variables: { input: { id, ...input } } });
          return this.props.children(callMutation);
        }}
      </Mutation>
    );
  }
}

UpdateChemistryQueryVariables.propTypes = {
  children: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired
};

export default UpdateChemistryQueryVariables;
