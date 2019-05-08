import React, { Component } from 'react';
import PropTypes from 'prop-types';

import MOLBLOCK_TO_SMILES from '../../graphql/compounds/molBlockToSmiles';

import { Mutation } from 'react-apollo';

class MolBlockToSmiles extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Mutation
        mutation={MOLBLOCK_TO_SMILES}
      >
        { molBlockToSmiles => {
          const callMutation = molblock => molBlockToSmiles({
            variables: { molblock },
          });
          return this.props.children(callMutation);
        }}
      </Mutation>
    );
  }
}

MolBlockToSmiles.propTypes = {
  children: PropTypes.func.isRequired,
};

export default MolBlockToSmiles;
