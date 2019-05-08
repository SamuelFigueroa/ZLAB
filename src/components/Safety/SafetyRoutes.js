import React, { Fragment } from 'react';
import { Route, Switch } from 'react-router-dom';
import queryString from 'query-string';
import PropTypes from 'prop-types';

import Safety from './Safety';
import SDSBinder from './SDSBinder';
import SDSCheck from './SDSCheck';
import SDSSearch from './SDSSearch';
import SDSInfo from './SDSInfo';

const SafetyRoutes = (props) => {
  const {user, isAuthenticated} = props.auth;
  return (
    <Fragment>
      <Route exact path="/safety" component={Safety}/>
      <Switch>
        <Route exact path="/safety/sds/all" component={SDSBinder}/>
        <Route exact path="/safety/sds/new" render={({ location }) => (
          queryString.parse(location.search).compound !== undefined ?
            <SDSSearch user={user} compound={queryString.parse(location.search).compound} />
            : <SDSCheck />
        )} />
        <Route exact path="/safety/sds/:id" render={
          ({ match }) => {
            return <SDSInfo user={user} isAuthenticated={isAuthenticated} id={match.params.id}/>;
          }} />
      </Switch>
    </Fragment>
  );
};

SafetyRoutes.propTypes = {
  auth: PropTypes.object.isRequired
};

export default SafetyRoutes;
