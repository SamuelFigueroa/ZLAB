import React, { Fragment } from 'react';
import { Route, Switch } from 'react-router-dom';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import Assets from './Assets';
import AssetTabs from './AssetTabs';
import EquipmentForm from './EquipmentForm';
import SupplyForm from './SupplyForm';
import EquipmentInfo from './EquipmentInfo';
import SupplyInfo from './SupplyInfo';
import GetAsset from '../queries/GetAsset';
import GetAssetQueryVariables from '../queries/GetAssetQueryVariables';
import AssetSearch from './AssetSearch';
import EquipmentInventory from './EquipmentInventory';

const assetForms = {
  equipment: EquipmentForm,
  consumables: SupplyForm,
};

const assetInfo ={
  equipment: EquipmentInfo,
  consumables: SupplyInfo,
};

const AssetRoutes = (props) => {
  const {user, isAuthenticated} = props.auth;
  return (
    <Fragment>
      <Route exact path="/assets" component={Assets}/>
      <Switch>
        <Route exact path="/assets/all" render={({ location })=><AssetTabs category={location.hash.slice(1)}/>}/>
        <Route exact path="/assets/search" render={({ location })=>(
          <GetAssetQueryVariables id="search_equipment">
            {
              equipmentQueryVariables => (
                <GetAssetQueryVariables id="search_consumables">
                  {
                    consumablesQueryVariables =>
                      <AssetSearch
                        initialized={(
                          equipmentQueryVariables.search === queryString.parse(location.search).q
                          && consumablesQueryVariables.search === queryString.parse(location.search).q
                        )}
                        results={{
                          equipment: equipmentQueryVariables.resultsCount,
                          consumables: consumablesQueryVariables.resultsCount
                        }}
                        search={queryString.parse(location.search).q}
                      />
                  }
                </GetAssetQueryVariables>
              )}
          </GetAssetQueryVariables>
        )} />
        <Route exact path="/assets/equipment/inventory" render={() => <EquipmentInventory />} />
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
    </Fragment>
  );
};

AssetRoutes.propTypes = {
  auth: PropTypes.object.isRequired
};

export default AssetRoutes;
