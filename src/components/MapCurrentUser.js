import React from 'react';
import GetCurrentUser from './queries/GetCurrentUser';

const MapCurrentUser = () => (
  //Takes array of components and adds the auth prop with current user from cache.
  //Returns the components to this.props.children
  <GetCurrentUser>
    { (user, isAuthenticated) => (
      isAuthenticated ? (
        null
      ) : (
        null
      )
    )}
  </GetCurrentUser>
);

export default MapCurrentUser;
