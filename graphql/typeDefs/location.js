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

  type StagedLocation {
    area: String!
    sub_area: String!
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
    containerCount: Int!
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

  input UpdateLocationInput {
    locationID: ID!
    subAreaID: ID!
    area: String!
    sub_area: String!
  }

  input DeleteLocationInput {
    locationID: ID!
    subAreaID: ID!
  }

  # Queries
  extend type Query {
    locations: [LocationObject]!
  }

  # Mutations
  extend type Mutation {

    #Create Mutations
    addLocation(input: AddLocationInput!) : Boolean

    #Update Mutations
    updateLocation(input: UpdateLocationInput!) : Boolean

    #Delete Mutations
    deleteLocation(input: [DeleteLocationInput!]!) : Boolean
  }
`;

export default () => [Location];
