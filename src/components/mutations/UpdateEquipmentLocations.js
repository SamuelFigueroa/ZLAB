import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import UPDATE_EQUIPMENT_LOCATIONS from '../../graphql/assets/updateEquipmentLocations';

class UpdateEquipmentLocations extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={UPDATE_EQUIPMENT_LOCATIONS}
            onError={ errorObj => handleError(errorObj) }
          >
            { updateEquipmentLocations => {
              const callMutation = (ids, area, sub_area) => updateEquipmentLocations({
                variables: { ids, area, sub_area },
              });
              return this.props.children(callMutation, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

UpdateEquipmentLocations.propTypes = {
  children: PropTypes.func.isRequired,
};

export default UpdateEquipmentLocations;
