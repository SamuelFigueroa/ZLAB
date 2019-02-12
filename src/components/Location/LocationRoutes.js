import React, { Fragment } from 'react';
import { Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';

import Spaces from './Spaces';
import LabLayout from './LabLayout';
import Locations from './Locations';
import GetLocations from '../queries/GetLocations';

const LocationRoutes = () => {
  return (
    <Fragment>
      <Route exact path="/spaces" component={Spaces}/>
      <Switch>
        <Route exact path="/spaces/layout" component={LabLayout}/>
        <Route exact path="/spaces/locations" render={()=>
          <GetLocations>
            { locations => (
              <Locations locations={locations} />
            )}
          </GetLocations>
        }/>
      </Switch>
    </Fragment>
  );
};

LocationRoutes.propTypes = {
  auth: PropTypes.object.isRequired
};

export default LocationRoutes;
