import { ApolloClient } from 'apollo-client';
import { ApolloLink, split } from 'apollo-link';
// import { HttpLink } from 'apollo-link-http';
import { createUploadLink } from 'apollo-upload-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { withClientState } from 'apollo-link-state';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/schema';
import { IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import introspectionQueryResultData from './fragmentTypes.json';

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData
});
// const httpLink =  new HttpLink({
//   uri: '/graphql',
//   credentials: 'include'
// });

const uploadLink = createUploadLink({
  uri: '/graphql',
  credentials: 'include'
});

const wsLink = new WebSocketLink({
  uri: `ws://${location.host}/graphql`,
  options: {
    reconnect: true
  }
});

const cache = new InMemoryCache({ fragmentMatcher });

const defaultState = {
  auth: {
    __typename: 'Auth',
    user: {
      __typename: 'UserPayload',
      exp: null,
      iat: null,
      login: null,
      name: null,
      email: null,
      admin: false
    },
    isAuthenticated: false,
  },
  errors: []
};

const stateLink = withClientState({
  cache,
  defaults: defaultState,
  resolvers,
  typeDefs
});

const authLink = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers }) => {
    const token = localStorage.getItem('jwtToken');

    return { headers: {
      ...headers,
      authorization: token ? `${token}` : '',
    }};
  });
  return forward(operation);
});

const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  ApolloLink.from([authLink, stateLink, uploadLink]),
);

const client = new ApolloClient({
  link,
  cache
});

export default client;
