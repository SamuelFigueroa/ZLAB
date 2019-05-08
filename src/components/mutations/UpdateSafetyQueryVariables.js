import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';

import UPDATE_SAFETY_QUERY_VARS from '../../graphql/safety/updateSafetyQueryVariables';

class UpdateSafetyQueryVariables extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { id } = this.props;
    return(
      <Mutation
        mutation={UPDATE_SAFETY_QUERY_VARS}
      >
        { updateSafetyQueryVariables => {
          const callMutation = input => updateSafetyQueryVariables({ variables: { input: { id, ...input } } });
          return this.props.children(callMutation);
        }}
      </Mutation>
    );
  }
}

UpdateSafetyQueryVariables.propTypes = {
  children: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired
};

export default UpdateSafetyQueryVariables;
