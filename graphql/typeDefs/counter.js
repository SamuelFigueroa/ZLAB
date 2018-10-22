import { gql } from 'apollo-server-express';

const Counter = gql`

input AddCounterInput {
  name: String!
  prefix: String!
}

extend type Mutation {
  #Create Mutations
  addCounter(input: AddCounterInput!) : Boolean
}
`;

export default () => [Counter];
