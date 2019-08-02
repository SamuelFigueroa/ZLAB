import { gql } from 'apollo-server-express';
import Location from './location';
import User from './user';

const ContainerCollection = gql`

  type ContainerCollection {
    id: ID!
    name: String!
    user: String!
    item: String!
    size: Int!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  type ContainerNormalization {
    id: String!
    field: String!
    unregistered: String!
    registerAs: String
  }

  type LocationNormalization {
    id: String!
    field: String!
    unregistered: StagedLocation!
    registerAs: StagedLocation
  }

  type UserNormalization {
    id: String!
    field: String!
    unregistered: String!
    registerAs: String
  }

  type StagedContainer {
    id: ID!
    category: String!
    barcode: String!
    content: StagedContent!
    vendor: String!
    catalog_id: String!
    institution: String!
    researcher: String!
    eln_id: String!
    state: String!
    mass: Float
    mass_units: String
    volume: Float
    vol_units: String
    concentration: Float
    conc_units: String
    solvent: String!
    location: StagedLocation!
    owner: String!
    description: String!
  }

  type StagedContent {
    smiles: String!
    molblock: String!
    name: String!
    description: String!
    storage: String!
    cas: String!
  }

  #INPUT

  input AddContainerCollectionInput {
    file: Upload!
    name: String!
    size: String!
    user: String!
  }

  input ContainerNormalizationInput {
    field: String!
    unregistered: String!
    registerAs: String!
  }

  input LocationNormalizationInput {
    unregistered: AddLocationInput!
    registerAs: AddLocationInput!
  }

  input UserNormalizationInput {
    unregistered: String!
    registerAs: String!
  }

  input NormalizeContainerCollectionInput {
    id: ID!
    containerFieldsNormalized: [ContainerNormalizationInput]!
    locationsNormalized: [LocationNormalizationInput]!
    usersNormalized: [UserNormalizationInput]!
  }

  type ContainerRegisteredEvent {
    registered: Int!
    errored: Int!
    collectionID: ID!
  }

  # Queries
  extend type Query {
    containerCollections: [ContainerCollection]!
    containerCollection(id: ID!): ContainerCollection!
    stagedContainers(collectionID: ID!, offset: Int!, limit: Int!): [StagedContainer]!
    containerNormalization(collectionID: ID!): [ContainerNormalization]!
    locationNormalization(collectionID: ID!): [LocationNormalization]!
    userNormalization(collectionID: ID!): [UserNormalization]!
  }

  # Mutations
  extend type Mutation {
    normalizeContainerCollection(input: NormalizeContainerCollectionInput!) : Boolean
    exportContainerCollection(id: ID!) : String
    exportRegistrationTemplate : String
    startRegistrationQueue : Boolean
    resetRegistrationQueue : Boolean

    #Create Mutations
    addContainerCollection(input: AddContainerCollectionInput!) : ContainerCollection

    #Update Mutations
    unqueueContainerCollection(ids: [ID!]!) : [ID]

    #Delete Mutations
    deleteContainerCollection(ids: [ID!]!) : [ID]
  }
  extend type Subscription {
    containerRegistered : ContainerRegisteredEvent!
    registrationQueued : ID!
    registrationStarted : ID!
    registrationFinished : ID!
  }
`;

export default () => [ContainerCollection, Location, User];
