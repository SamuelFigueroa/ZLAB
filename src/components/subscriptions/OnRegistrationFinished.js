import React, { Component } from 'react';
import PropTypes from 'prop-types';

import REGISTRATION_FINISHED from '../../graphql/containerCollections/registrationFinished';

import { Subscription } from 'react-apollo';

class OnRegistrationFinished extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { onRegistrationFinished, collectionID } = this.props;
    return(
      <Subscription
        subscription={REGISTRATION_FINISHED}
        onSubscriptionData={({ subscriptionData: { data: { registrationFinished: id }}}) => {
          if( collectionID === id )
            return onRegistrationFinished();
        }}
      >
        { this.props.children }
      </Subscription>
    );
  }
}

OnRegistrationFinished.propTypes = {
  children: PropTypes.func.isRequired,
  onRegistrationFinished: PropTypes.func.isRequired,
  collectionID: PropTypes.string.isRequired
};

export default OnRegistrationFinished;
