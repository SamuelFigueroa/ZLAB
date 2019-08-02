import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';

import UPDATE_LOCATION_NORMALIZATION from '../../graphql/containerCollections/updateLocationNormalization';

class UpdateLocationNormalization extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Mutation
        mutation={UPDATE_LOCATION_NORMALIZATION}
      >
        { updateLocationNormalization => {
          const callMutation = input => updateLocationNormalization({ variables: { input } });
          return this.props.children(callMutation);
        }}
      </Mutation>
    );
  }
}

UpdateLocationNormalization.propTypes = {
  children: PropTypes.func.isRequired,
};

export default UpdateLocationNormalization;
