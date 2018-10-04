import React, { Fragment } from 'react';
import { Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import Register from './Register';

import Assets from './Assets';
import EquipmentForm from './EquipmentForm';
import SupplyForm from './SupplyForm';
import EquipmentInfo from './EquipmentInfo';
import SupplyInfo from './SupplyInfo';
import GetAsset from './queries/GetAsset';
import Printers from './Printers';

const assetForms = {
  equipment: EquipmentForm,
  supplies: SupplyForm,
};

const assetInfo ={
  equipment: EquipmentInfo,
  supplies: SupplyInfo,
};

const PrivateRoutes = ({ auth }) => {
  const {user, isAuthenticated} = auth;
  return (
    <Fragment>
      <Route exact path="/assets" render={()=><Assets />} />
      <Switch>
        <Route exact path="/assets/:category/new" render={
          ({ match }) => {
            let AssetForm = assetForms[match.params.category];
            return <AssetForm user={user} />;
          }} />
        <Route exact path="/assets/:category/:id" render={
          ({ match }) => {
            let AssetInfo = assetInfo[match.params.category];
            return <AssetInfo user={user} isAuthenticated={isAuthenticated} id={match.params.id}/>;
          }} />
        <Route exact path="/assets/:category/:id/update" render={({ match }) => (
          <GetAsset id={match.params.id}>
            { asset => {
              let AssetForm = assetForms[match.params.category];
              return <AssetForm user={user} initialState={asset}/>;
            }}
          </GetAsset>
        )}/>
      </Switch>
      <Route exact path="/printers" render={()=><Printers />} />
      {
        user.admin ? (
          <Route exact path="/register" component={Register} />
        ) : null
      }
    </Fragment>
  );
};
PrivateRoutes.propTypes = {
  auth: PropTypes.object.isRequired
};
export default PrivateRoutes;
