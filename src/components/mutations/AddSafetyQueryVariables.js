import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';

import ADD_SAFETY_QUERY_VARS from '../../graphql/safety/addSafetyQueryVariables';

class AddSafetyQueryVariables extends Component {
  constructor(props) {
    super(props);
    this.state = {
      completed: false
    };
  }

  render() {
    const { id } = this.props;
    return(
      <Mutation
        mutation={ADD_SAFETY_QUERY_VARS}
        onCompleted={()=>this.setState({ completed: true })}
      >
        { addSafetyQueryVariables => {
          const callMutation = async variables => await addSafetyQueryVariables({ variables: { input: { id, typename: 'SafetyQueryVariables', ...variables } },
          });
          return this.props.children(callMutation, this.state.completed);
        }}
      </Mutation>
    );
  }
}

AddSafetyQueryVariables.propTypes = {
  children: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
};

export default AddSafetyQueryVariables;
