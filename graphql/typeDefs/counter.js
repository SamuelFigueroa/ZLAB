import { gql } from 'apollo-server-express';

const Counter = gql`

input AddCounterInput {
  name: String!
  prefix: String!
  numDigits: Int
}

type Counter {
  id: ID!
  name: String!
  prefix: String!
  numDigits: Int!
  value: Int!
}

extend type Query {
  counters: [Counter]!
}

extend type Mutation {
  #Create Mutations
  addCounter(input: AddCounterInput!) : Boolean

  updateCounter(name: String!, numDigits: Int!) : Boolean

  deleteCounter(id: ID!) : Boolean
}
`;

export default () => [Counter];
