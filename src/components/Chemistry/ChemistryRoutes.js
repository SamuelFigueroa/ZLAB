import React, { Fragment } from 'react';
import { Route, Switch } from 'react-router-dom';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import Chemistry from './Chemistry';
import ChemistryTabs from './ChemistryTabs';
import ReagentForm from './ReagentForm';
// import SampleForm from './SampleForm';
import ReagentInfo from './ReagentInfo';
// import SampleInfo from './SampleInfo';
import GetReagent from '../queries/GetReagent';
import GetCompounds from '../queries/GetReagents';
import ChemistrySearch from './ChemistrySearch';

const chemistryForms = {
  reagents: ReagentForm,
  // samples: SampleForm,
};

const chemistryInfo ={
  reagents: ReagentInfo,
  // samples: SampleInfo,
};

const ChemistryRoutes = (props) => {
  const {user, isAuthenticated} = props.auth;
  return (
    <Fragment>
      <Route exact path="/chemistry" component={Chemistry}/>
      <Switch>
        <Route exact path="/chemistry/all" render={({ location })=><ChemistryTabs category={location.hash.slice(1)}/>}/>
        <Route exact path="/chemistry/search" render={({ location })=>(
          <GetCompounds>
            {
              (getCompounds, errors, clearErrors) =>
                <ChemistrySearch
                  data={{
                    query: getCompounds,
                    errors,
                    clearErrors
                  }}
                  search={queryString.parse(location.search).q}
                />
            }
          </GetCompounds>
        )} />
        <Route exact path="/chemistry/:category/new" render={
          ({ match }) => {
            let ChemistryForm = chemistryForms[match.params.category];
            return <ChemistryForm user={user} />;
          }} />
        <Route exact path="/chemistry/:category/:id" render={
          ({ match, location }) => {
            let ChemistryInfo = chemistryInfo[match.params.category];
            return <ChemistryInfo user={user} isAuthenticated={isAuthenticated} id={match.params.id} section={location.hash.slice(1)}/>;
          }} />
        <Route exact path="/chemistry/:category/:id/update" render={({ match }) => (
          <GetReagent id={match.params.id}>
            { reagent => {
              let ChemistryForm = chemistryForms[match.params.category];
              return <ChemistryForm user={user} initialState={reagent}/>;
            }}
          </GetReagent>
        )}/>
      </Switch>
    </Fragment>
  );
};

ChemistryRoutes.propTypes = {
  auth: PropTypes.object.isRequired
};

export default ChemistryRoutes;
