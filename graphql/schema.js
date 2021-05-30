import { gql } from 'apollo-server-express';

import Asset from './typeDefs/asset';
import Counter from './typeDefs/counter';
import Printer from './typeDefs/printer';
import User from './typeDefs/user';
import Compound from './typeDefs/compound';
import Container from './typeDefs/container';
import Transfer from './typeDefs/transfer';
import Safety from './typeDefs/safety';
import ContainerCollection from './typeDefs/containerCollection';

import assetResolvers from './resolvers/asset';
import compoundResolvers from './resolvers/compound';
import containerResolvers from './resolvers/container';
import transferResolvers from './resolvers/transfer';
import safetyResolvers from './resolvers/safety';
import counterResolvers from './resolvers/counter';
import documentResolvers from './resolvers/document';
import locationResolvers from './resolvers/location';
import printerResolvers from './resolvers/printer';
import userResolvers from './resolvers/user';
import containerCollectionResolvers from './resolvers/containerCollection';

const Schema = gql`

  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }

  interface Node {
    id: ID!
  }

  type Error {
    key: String
    message: String
  }

  input ErrorInput {
    key: String,
    message: String
  }

  type Query {
    errors: [Error]!
  }

  type Mutation {
    setErrors(errors: [ErrorInput]!) : Boolean
  }

  type Subscription
`;

export const
  typeDefs = () => [
    Schema, Asset, Compound,
    Container, Transfer, Safety,
    Counter, Printer, User,
    ContainerCollection
  ],
  resolvers = [
    assetResolvers, compoundResolvers, containerResolvers,
    transferResolvers, safetyResolvers, counterResolvers,
    documentResolvers, locationResolvers, printerResolvers,
    userResolvers, containerCollectionResolvers
  ];
