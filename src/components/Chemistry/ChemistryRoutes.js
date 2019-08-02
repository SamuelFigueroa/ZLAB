import React, { Fragment } from 'react';
import { Route, Switch } from 'react-router-dom';
import queryString from 'query-string';
import PropTypes from 'prop-types';

import Chemistry from './Chemistry';
import ChemistryTabs from './ChemistryTabs';
import CompoundForm from './CompoundForm';
import CompoundInfo from './CompoundInfo';
import GetCompound from '../queries/GetCompound';
import ChemistrySearch from './ChemistrySearch';
import ExactStructureSearch from './ExactStructureSearch';
import ContainerForm from './ContainerForm';
import ContainerInfo from './ContainerInfo';
import GetContainer from '../queries/GetContainer';
import GetChemistryQueryVariables from '../queries/GetChemistryQueryVariables';
import CurationForm from './CurationForm';
import MassTransferForm from './MassTransferForm';
import VolumeTransferForm from './VolumeTransferForm';
import DryContainerForm from './DryContainerForm';
import ResuspendContainerForm from './ResuspendContainerForm';
import SampleHandling from './SampleHandling';
import ContainerInventory from './ContainerInventory';
import ChemistryRegistration from './ChemistryRegistration';
import ContainerCollections from './ContainerCollections';
import NormalizationSteps from './NormalizationSteps';
import GetContainerCollection from '../queries/GetContainerCollection';
import RegistrationProgress from './RegistrationProgress';

const ChemistryRoutes = (props) => {
  const {user, isAuthenticated} = props.auth;
  return (
    <Fragment>
      <Route exact path="/chemistry" component={Chemistry}/>
      <Switch>
        <Route exact path="/chemistry/all" render={({ location })=><ChemistryTabs category={location.hash.slice(1)}/>}/>
        <Route exact path="/chemistry/containers/inventory" render={() => <ContainerInventory />} />
        <Route exact path="/chemistry/search" render={({ location })=>(
          <GetChemistryQueryVariables id="search_containers">
            {
              containerQueryVariables => (
                <GetChemistryQueryVariables id="search_compounds">
                  {
                    compoundQueryVariables =>
                      <ChemistrySearch
                        initialized={(
                          containerQueryVariables.search === queryString.parse(location.search).q
                          && compoundQueryVariables.search === queryString.parse(location.search).q
                        )}
                        results={!(
                          containerQueryVariables.resultsCount === 0
                          && compoundQueryVariables.resultsCount === 0
                        )}
                        search={queryString.parse(location.search).q}
                      />
                  }
                </GetChemistryQueryVariables>
              )}
          </GetChemistryQueryVariables>
        )} />
        <Route exact path="/chemistry/compounds/register" render={()=><ChemistryRegistration />} />
        <Route exact path="/chemistry/compounds/structureCheck" render={()=><ExactStructureSearch />} />
        <Route exact path="/chemistry/compounds/new" render={({ location }) => {
          const cas = queryString.parse(location.search).cas !== undefined ? queryString.parse(location.search).cas : '';
          return queryString.parse(location.search).smiles !== undefined ?
            <CompoundForm user={user} cas={cas} structure={queryString.parse(location.search).smiles}/> :
            <CompoundForm user={user} cas={cas} />;
        }} />
        <Route exact path="/chemistry/compounds/:id" render={
          ({ match, location }) => {
            return <CompoundInfo user={user} isAuthenticated={isAuthenticated} id={match.params.id} section={location.hash.slice(1)}/>;
          }} />
        <Route exact path="/chemistry/compounds/:id/update" render={({ match }) => (
          <GetCompound id={match.params.id}>
            { compound => {
              return <CompoundForm user={user} initialState={compound}/>;
            }}
          </GetCompound>
        )}/>
        <Route exact path="/chemistry/containers/register" render={()=><ChemistryRegistration />} />
        <Route exact path="/chemistry/containers/structureCheck" render={()=><ExactStructureSearch />} />
        <Route exact path="/chemistry/containers/collections" render={()=><ContainerCollections user={user}/>} />
        <Route exact path="/chemistry/containers/collections/:id" render={({ match })=>(
          <GetContainerCollection id={match.params.id}>
            { (collection, refetch) => collection.status === 'Initial' ?
              <NormalizationSteps collection={collection} handleRegistrationQueued={refetch} />
              : ( collection.status !== 'Queued' ?
                <RegistrationProgress collection={collection} handleRegistrationFinished={refetch}/> : null )
            }
          </GetContainerCollection>

        )} />
        <Route exact path="/chemistry/containers/handleSamples" render={()=><SampleHandling />} />
        <Route exact path="/chemistry/containers/transferMass" render={()=><MassTransferForm />} />
        <Route exact path="/chemistry/containers/transferVolume" render={()=><VolumeTransferForm />} />
        <Route exact path="/chemistry/containers/dry" render={()=><DryContainerForm />} />
        <Route exact path="/chemistry/containers/resuspend" render={()=><ResuspendContainerForm />} />
        <Route exact path="/chemistry/containers/:id" render={
          ({ match, location }) => {
            return <ContainerInfo isAuthenticated={isAuthenticated} id={match.params.id} section={location.hash.slice(1)}/>;
          }} />
        <Route exact path="/chemistry/containers/:id/update" render={({ match }) => (
          <GetContainer id={match.params.id}>
            { container => {
              return <ContainerForm user={user} initialState={container}/>;
            }}
          </GetContainer>
        )}/>
        <Route exact path="/chemistry/containers/:id/curateStructure" render={({ match }) => (
          <GetContainer id={match.params.id}>
            { container => {
              return <CurationForm author={user.login} batchID={container.batch_id} structure={container.content.molblock} />;
            }}
          </GetContainer>
        )}/>
      </Switch>
    </Fragment>
  );
};

ChemistryRoutes.propTypes = {
  auth: PropTypes.object.isRequired
};

export default ChemistryRoutes;
