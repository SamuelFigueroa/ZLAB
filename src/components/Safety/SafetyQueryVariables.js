import React, { Component } from 'react';
import PropTypes from 'prop-types';

import AddSafetyQueryVariables from '../mutations/AddSafetyQueryVariables';
import UpdateSafetyQueryVariables from '../mutations/UpdateSafetyQueryVariables';
import GetSafetyQueryVariables from '../queries/GetSafetyQueryVariables';

class SafetyQueryVariables extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { id } = this.props;
    return(
      <GetSafetyQueryVariables id={id}>
        { getQueryVariables => (
          <UpdateSafetyQueryVariables id={id}>
            { updateQueryVariables => (
              <AddSafetyQueryVariables id={id}>
                { (addQueryVariables, initialized) =>
                  this.props.children(getQueryVariables, addQueryVariables, updateQueryVariables, initialized)
                }
              </AddSafetyQueryVariables>
            )}
          </UpdateSafetyQueryVariables>
        )}
      </GetSafetyQueryVariables>
    );
  }
}

SafetyQueryVariables.propTypes = {
  children: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired
};

export default SafetyQueryVariables;
