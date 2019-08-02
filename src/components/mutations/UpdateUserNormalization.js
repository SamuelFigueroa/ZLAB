import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';

import UPDATE_USER_NORMALIZATION from '../../graphql/containerCollections/updateUserNormalization';

class UpdateUserNormalization extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Mutation
        mutation={UPDATE_USER_NORMALIZATION}
      >
        { updateUserNormalization => {
          const callMutation = input => updateUserNormalization({ variables: { input } });
          return this.props.children(callMutation);
        }}
      </Mutation>
    );
  }
}

UpdateUserNormalization.propTypes = {
  children: PropTypes.func.isRequired,
};

export default UpdateUserNormalization;
