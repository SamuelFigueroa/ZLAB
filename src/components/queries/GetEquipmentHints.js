import React, { Component } from 'react';
import PropTypes from 'prop-types';

import GET_EQUIPMENT_HINTS from '../../graphql/assets/getEquipmentHints';

import { Query } from 'react-apollo';

class GetEquipmentHints extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Query query={GET_EQUIPMENT_HINTS}>
        { ({ data, loading, error }) => {
          if (loading) return null;
          if (error) return error;

          const { equipmentHints } = data;
          return this.props.children(equipmentHints);
        }}
      </Query>
    );
  }
}

GetEquipmentHints.propTypes = {
  children: PropTypes.func.isRequired
};

export default GetEquipmentHints;
