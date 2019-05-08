import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';

import ADD_CHEMISTRY_QUERY_VARS from '../../graphql/chemistry/addChemistryQueryVariables';

class AddChemistryQueryVariables extends Component {
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
        mutation={ADD_CHEMISTRY_QUERY_VARS}
        onCompleted={()=>this.setState({ completed: true })}
      >
        { addChemistryQueryVariables => {
          const callMutation = async variables => await addChemistryQueryVariables({ variables: { input: { id, typename: 'ChemistryQueryVariables', ...variables } },
          });
          return this.props.children(callMutation, this.state.completed);
        }}
      </Mutation>
    );
  }
}

AddChemistryQueryVariables.propTypes = {
  children: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
};

export default AddChemistryQueryVariables;
