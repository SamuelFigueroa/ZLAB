import React, { Fragment } from 'react';
import { Route, Switch } from 'react-router-dom';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import Register from './Register';
import Assets from './Assets';
import AssetTabs from './AssetTabs';
import EquipmentForm from './EquipmentForm';
import SupplyForm from './SupplyForm';
import EquipmentInfo from './EquipmentInfo';
import SupplyInfo from './SupplyInfo';
import GetAsset from './queries/GetAsset';
import GetAssets from './queries/GetAssets';
import AssetSearch from './AssetSearch';
import PrinterRoutes from './Printer/PrinterRoutes';
// import ChemicalEditor from './ChemicalEditor';
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
      <Route exact path="/assets" component={Assets}/>
      <Switch>
        <Route exact path="/assets/all" render={({ location })=><AssetTabs category={location.hash.slice(1)}/>}/>
        <Route exact path="/assets/search" render={({ location })=>(
          <GetAssets>
            {
              (getAssets, errors, clearErrors) =>
                <AssetSearch
                  data={{
                    query: getAssets,
                    errors,
                    clearErrors
                  }}
                  search={queryString.parse(location.search).q}
                />
            }
          </GetAssets>
        )} />
        <Route exact path="/assets/:category/new" render={
          ({ match }) => {
            let AssetForm = assetForms[match.params.category];
            return <AssetForm user={user} />;
          }} />
        <Route exact path="/assets/:category/:id" render={
          ({ match, location }) => {
            let AssetInfo = assetInfo[match.params.category];
            return <AssetInfo user={user} isAuthenticated={isAuthenticated} id={match.params.id} section={location.hash.slice(1)}/>;
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
      <PrinterRoutes />
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
