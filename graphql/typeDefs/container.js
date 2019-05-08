import { gql } from 'apollo-server-express';
import Compound from './compound';
import Location from './location';
import Registration from './registration';
import Range from './range';

const Container = gql`

  type Container {
    id: ID!
    category: String!
    barcode: String!
    content: Content!
    batch_id: String!
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
    location: Location!
    owner: ID!
    description: String!
    registration_event: RegistrationEvent!
  }

  type Content {
    id: ID!
    smiles: String!
    molblock: String!
    compound_id: String!
    name: String!
    description: String!
    attributes: [String]!
    storage: String!
    cas: String!
    safety: ID
    registration_event: RegistrationEvent!
  }

  type ContainerHint {
    vendor: [String]!
    institution: [String]!
    researcher: [String]!
    solvent: [String]!
  }

  #INPUT

  input ContainerFilter {
    category: [String]
    vendor: [String]
    institution: [String]
    researcher: [String]
    state: [String]
    mass: NumberRange
    mass_units: UnitRange
    volume: NumberRange
    vol_units: UnitRange
    concentration: NumberRange
    conc_units: UnitRange
    solvent: [String]
    location: [ID]
    owner: [ID]
    registration_event: RegistrationEventFilter
  }

  input AddContainerInput {
    content: ID
    category: String!
    barcode: String!
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
    location: LocationInput!
    owner: ID!
    description: String!
    registration_event: RegistrationEventInput!
  }

  input UpdateContainerInput {
    id: ID!
    content: ID!
    category: String!
    barcode: String!
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
    location: LocationInput!
    owner: ID!
    description: String!
  }

  input ExportContainerDataInput {
    filter: CompoundFilter
    search: String
    search2: String!
    searchCategories: [String]!
    name: String!
  }

  # Queries
  extend type Query {
    containers(filter: CompoundFilter, search: String): [Container]!
    container(id: ID!): Container!
    containerHints: ContainerHint!
  }

  # Mutations
  extend type Mutation {
    exportContainerData(input: ExportContainerDataInput!) : String
    inventorizeContainer(barcode: String!) : Boolean

    #Create Mutations
    addContainer(input: AddContainerInput!) : Boolean

    #Update Mutations
    updateContainer(input: UpdateContainerInput!) : Boolean
    updateContainerLocations(ids: [ID!]!, area: ID!, sub_area: ID!) : Boolean

    #Delete Mutations
    deleteContainer(id: ID!) : Boolean
  }

  # Subscriptions
  extend type Subscription {
    containerInventorized : Container!
  }
`;

export default () => [Container, Compound, Location, Range, Registration];
