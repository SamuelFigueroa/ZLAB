import React, { Fragment } from 'react';
import { Route, Switch } from 'react-router-dom';

import Register from './Register';

import GetCurrentUser from './queries/GetCurrentUser';

import Assets from './Assets';
import AssetForm from './AssetForm';
import AssetInfo from './AssetInfo';
import GetAsset from './queries/GetAsset';

const PrivateRoutes = () => (
  <GetCurrentUser>
    { (user, isAuthenticated) => {
      return isAuthenticated ? (
        <Fragment>
          <Route exact path="/assets" render={()=><Assets />} />
          <Switch>
            <Route exact path="/assets/new" render={()=><AssetForm user={user} />} />
            <Route exact path="/assets/:id" render={({ match })=><AssetInfo user={user} isAuthenticated={isAuthenticated} id={match.params.id}/>} />
            <Route exact path="/assets/:id/update" render={({ match }) => (
              <GetAsset id={match.params.id}>
                { asset => <AssetForm user={user} initialState={asset}/> }
              </GetAsset>
            )}/>
          </Switch>
          {
            user.admin ? (
              <Route exact path="/register" component={Register} />
            ) : null
          }
        </Fragment>
      ) : (
        null
      );
    }}
  </GetCurrentUser>
);

export default PrivateRoutes;
