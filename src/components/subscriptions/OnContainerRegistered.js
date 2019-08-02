import React, { Component } from 'react';
import PropTypes from 'prop-types';

import CONTAINER_REGISTERED from '../../graphql/containerCollections/containerRegistered';

import { Subscription } from 'react-apollo';

class OnContainerRegistered extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { onContainerRegistered, collectionID: id } = this.props;
    return(
      <Subscription
        subscription={CONTAINER_REGISTERED}
        onSubscriptionData={({ subscriptionData: { data: { containerRegistered }}}) => {
          const { collectionID, registered, errored } = containerRegistered;
          if( collectionID == id )
            return onContainerRegistered({ registered, errored });
        }}
      >
        { this.props.children }
      </Subscription>
    );
  }
}

OnContainerRegistered.propTypes = {
  children: PropTypes.func.isRequired,
  onContainerRegistered: PropTypes.func.isRequired,
  collectionID: PropTypes.string.isRequired
};

export default OnContainerRegistered;
