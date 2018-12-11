import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SMILES_TO_MOLBLOCK from '../../graphql/compounds/smilesToMolBlock';

import { Mutation } from 'react-apollo';

class SmilesToMolBlock extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Mutation
        mutation={SMILES_TO_MOLBLOCK}
      >
        { smilesToMolBlock => {
          const callMutation = smiles => smilesToMolBlock({
            variables: { smiles },
          });
          return this.props.children(callMutation);
        }}
      </Mutation>
    );
  }
}

SmilesToMolBlock.propTypes = {
  children: PropTypes.func.isRequired,
};

export default SmilesToMolBlock;
