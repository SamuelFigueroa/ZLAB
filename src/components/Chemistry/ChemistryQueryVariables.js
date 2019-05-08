import React, { Component } from 'react';
import PropTypes from 'prop-types';

import AddChemistryQueryVariables from '../mutations/AddChemistryQueryVariables';
import UpdateChemistryQueryVariables from '../mutations/UpdateChemistryQueryVariables';
import GetChemistryQueryVariables from '../queries/GetChemistryQueryVariables';

class ChemistryQueryVariables extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { id } = this.props;
    return(
      <GetChemistryQueryVariables id={id}>
        { getQueryVariables => (
          <UpdateChemistryQueryVariables id={id}>
            { updateQueryVariables => (
              <AddChemistryQueryVariables id={id}>
                { (addQueryVariables, initialized) =>
                  this.props.children(getQueryVariables, addQueryVariables, updateQueryVariables, initialized)
                }
              </AddChemistryQueryVariables>
            )}
          </UpdateChemistryQueryVariables>
        )}
      </GetChemistryQueryVariables>
    );
  }
}

ChemistryQueryVariables.propTypes = {
  children: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired
};

export default ChemistryQueryVariables;
