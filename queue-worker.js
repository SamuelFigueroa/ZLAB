import fetch from 'node-fetch';
import WebSocket from 'ws';
import gql from 'graphql-tag';

import { host, port } from './config';

import { ApolloClient } from 'apollo-client';
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { ApolloLink, split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

const START_REGISTRATION_QUEUE = gql`
  mutation  {
    startRegistrationQueue
  }
`;

const REGISTRATION_QUEUED = gql`
  subscription onRegistrationQueued {
    registrationQueued
  }
`;

const REGISTRATION_FINISHED = gql`
  subscription onRegistrationFinished {
    registrationFinished
  }
`;

const RESET_REGISTRATION_QUEUE = gql`
  mutation  {
    resetRegistrationQueue
  }
`;

export default introspectionQueryResultData => {
  const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData
  });
  const wsLink = new WebSocketLink({
    uri: `ws://${host}:${port}/graphql`,
    options: {
      reconnect: true
    },
    webSocketImpl: WebSocket
  });
  const cache = new InMemoryCache({ fragmentMatcher });
  const httpLink = new HttpLink({ uri: `http://${host}:${port}/graphql`, fetch });
  const link = split(
    // split based on operation type
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    ApolloLink.from([httpLink]),
  );
  const client = new ApolloClient({
    link,
    cache
  });

  const startRegistrationQueue = async () => await client.mutate({ mutation: START_REGISTRATION_QUEUE });
  client.mutate({ mutation: RESET_REGISTRATION_QUEUE })
    .then(() => {
      client
        .subscribe({ query: REGISTRATION_QUEUED })
        .subscribe({
          next: startRegistrationQueue,
          error(err) { console.error('err', err); }
        });
      client
        .subscribe({ query: REGISTRATION_FINISHED })
        .subscribe({
          next: startRegistrationQueue,
          error(err) { console.error('err', err); }
        });
    });
};
