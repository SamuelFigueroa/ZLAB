import { gql } from 'apollo-server-express';

const Location = gql`

  type LocationObject {
    id: ID!
    area: AreaObject!
  }

  type Location {
    area: Area!
    sub_area: SubArea!
  }

  type AreaObject {
    name: String!
    sub_areas: [SubArea]!
  }

  type Area {
    id: ID!
    name: String!
  }

  type SubArea {
    id: ID!
    name: String!
  }

  #INPUT

  input LocationInput {
    area: ID!
    sub_area: ID!
  }

  input AddLocationInput {
    area: String!
    sub_area: String!
  }

  # Queries
  extend type Query {
    locations: [LocationObject]!
  }

  # Mutations
  extend type Mutation {

    #Create Mutations
    addLocation(input: AddLocationInput!) : Boolean
  }
`;

export default () => [Location];
