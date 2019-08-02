import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';

import UPDATE_CONTAINER_NORMALIZATION from '../../graphql/containerCollections/updateContainerNormalization';

class UpdateContainerNormalization extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Mutation
        mutation={UPDATE_CONTAINER_NORMALIZATION}
      >
        { updateContainerNormalization => {
          const callMutation = input => updateContainerNormalization({ variables: { input } });
          return this.props.children(callMutation);
        }}
      </Mutation>
    );
  }
}

UpdateContainerNormalization.propTypes = {
  children: PropTypes.func.isRequired,
};

export default UpdateContainerNormalization;
