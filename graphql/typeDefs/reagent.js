import { gql } from 'apollo-server-express';
import Document from './document';
import Location from './location';
import Registration from './registration';
import Range from './range';

const Reagent = gql`

  type Reagent {
    id: ID!
    containers: [ReagentContainer]!
    smiles: String!
    molblock: String!
    compound_id: String!
    name: String!
    description: String!
    attributes: [String]!
    safety: Document
    flags: [String]!
    storage: String!
    cas: String!
    registration_event: RegistrationEvent!
  }

  type ReagentContainer {
    id: ID!
    barcode: String!
    vendor: String!
    catalog_id: String!
    institution: String!
    chemist: String!
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

  type ReagentHint {
    containers: ReagentContainerHint!
    attributes: [String]!
    flags: [String]!
    storage: [String]!
  }

  type ReagentContainerHint {
    vendor: [String]!
    institution: [String]!
    chemist: [String]!
    solvent: [String]!
  }

  #INPUT

  input AddReagentInput {
    container: AddReagentContainerInput!
    molblock: String!
    name: String!
    description: String!
    attributes: [String]!
    flags: [String]!
    storage: String!
    cas: String!
    registration_event: RegistrationEventInput!
  }

  input ReagentFilter {
    attributes: [String]
    flags: [String]
    storage: [String]
    containers: ReagentContainerFilter
    registration_event: RegistrationEventFilter
  }

  input ReagentContainerFilter {
    vendor: [String]
    institution: [String]
    chemist: [String]
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

  input ExportReagentDataInput {
    filter: ReagentFilter!
    search: String
    search2: String!
    searchCategories: [String]!
    name: String!
  }

  input UpdateReagentInput {
    id: ID!
    molblock: String!
    name: String!
    description: String!
    attributes: [String]!
    flags: [String]!
    storage: String!
    cas: String!
  }

  input AddReagentContainerInput {
    reagentID: ID
    vendor: String!
    catalog_id: String!
    institution: String!
    chemist: String!
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

  input UpdateReagentContainerInput {
    reagentID: ID!
    containerID: ID!
    vendor: String!
    catalog_id: String!
    institution: String!
    chemist: String!
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

  # Queries
  extend type Query {
    reagents(filter: ReagentFilter, search: String): [Reagent]!
    reagent(id: ID!): Reagent!
    reagentHints: ReagentHint!
  }

  # Mutations
  extend type Mutation {
    exportReagentData(input: ExportReagentDataInput!) : String

    #Create Mutations
    addReagent(input: AddReagentInput!) : ID

    #Update Mutations
    addReagentContainer(input: AddReagentContainerInput!) : Boolean
    updateReagent(input: UpdateReagentInput!) : Boolean
    updateReagentContainer(input: UpdateReagentContainerInput!) : Boolean

    #Delete Mutations
    deleteReagent(id: ID!) : Boolean
    deleteReagentContainer(ids: [ID!]!, reagentID: ID!) : Boolean
  }
`;

export default () => [Reagent, Location, Document, Range, Registration];
