import { gql } from 'apollo-server-express';

import Asset from './typeDefs/asset';
import Counter from './typeDefs/counter';
import Printer from './typeDefs/printer';
import User from './typeDefs/user';
import Reagent from './typeDefs/reagent';

import assetResolvers from './resolvers/asset';
import reagentResolvers from './resolvers/reagent';
import counterResolvers from './resolvers/counter';
import documentResolvers from './resolvers/document';
import locationResolvers from './resolvers/location';
import printerResolvers from './resolvers/printer';
import userResolvers from './resolvers/user';

const Schema = gql`

  schema {
    query: Query
    mutation: Mutation
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
`;

export const
  typeDefs = () => [Schema, Asset, Reagent, Counter, Printer, User],
  resolvers = [assetResolvers, reagentResolvers, counterResolvers, documentResolvers, locationResolvers, printerResolvers, userResolvers];
