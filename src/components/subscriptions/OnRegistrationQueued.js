import React, { Component } from 'react';
import PropTypes from 'prop-types';

import REGISTRATION_QUEUED from '../../graphql/containerCollections/registrationQueued';

import { Subscription } from 'react-apollo';

class OnRegistrationQueued extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { onRegistrationQueued, collectionID } = this.props;
    return(
      <Subscription
        subscription={REGISTRATION_QUEUED}
        onSubscriptionData={({ subscriptionData: { data: { registrationQueued: id }}}) => {
          if( collectionID === id )
            return onRegistrationQueued();
        }}
      >
        { this.props.children }
      </Subscription>
    );
  }
}

OnRegistrationQueued.propTypes = {
  children: PropTypes.func.isRequired,
  onRegistrationQueued: PropTypes.func.isRequired,
  collectionID: PropTypes.string.isRequired
};

export default OnRegistrationQueued;
