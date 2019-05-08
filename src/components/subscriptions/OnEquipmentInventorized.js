import React, { Component } from 'react';
import PropTypes from 'prop-types';

import EQUIPMENT_INVENTORIZED from '../../graphql/assets/equipmentInventorized';

import { Subscription } from 'react-apollo';

class OnEquipmentInventorized extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { onEquipmentInventorized } = this.props;
    return(
      <Subscription
        subscription={EQUIPMENT_INVENTORIZED}
        onSubscriptionData={({ subscriptionData: { data: { equipmentInventorized: equipment }}}) => {
          let formatted_equipment = {
            ...equipment,
            formatted_location: (equipment.location.area.name == 'UNASSIGNED') ?
              'UNASSIGNED' : `${equipment.location.area.name} / ${equipment.location.sub_area.name}`,

          };
          return onEquipmentInventorized(formatted_equipment);
        }}
      >
        { this.props.children }
      </Subscription>
    );
  }
}

OnEquipmentInventorized.propTypes = {
  children: PropTypes.func.isRequired,
  onEquipmentInventorized: PropTypes.func.isRequired
};

export default OnEquipmentInventorized;
