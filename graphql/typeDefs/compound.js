import { gql } from 'apollo-server-express';
import Document from './document';
import Location from './location';
import Registration from './registration';
import Range from './range';
import Container from './container';

const Compound = gql`

  type Compound implements Node {
    id: ID!
    containers: [Container]!
    smiles: String!
    molblock: String!
    compound_id: String!
    name: String!
    description: String!
    attributes: [String]!
    safety: ID
    storage: String!
    cas: String!
    transfers: [TransferEvent]!
    curations: [CurationEvent]!
    registration_event: RegistrationEvent!
    molWt: Float
    molFormula: String!
  }

  type InventoryCompoundsConnection {
    totalCount: Int!
    pageInfo: PageInfo!
    edges: [InventoryCompoundsEdge]
  }

  type InventoryCompoundsEdge {
    cursor: String!
    node: Compound
  }

  type CompoundInventory {
    compoundsConnection(
      first: Int,
      after: String,
      last: Int,
      before: String,
    ): InventoryCompoundsConnection
  }

  type PageInfo {
    hasPreviousPage: Boolean!
    hasNextPage: Boolean!
    startCursor: String!
    endCursor: String!
  }

  type TransferEvent {
    source: ID!
    destination: ID!
    amount: Float!
    amount_units: String!
    timestamp: String!
  }

  type CurationEvent {
    previous_batch_id: String!
    previous_smiles: String!
    new_batch_id: String!
    new_smiles: String!
    author: String!
    reason: String!
    timestamp: String!
  }

  type CompoundHint {
    attributes: [String]!
    storage: [String]!
  }

  #INPUT

  input AddCompoundInput {
    container: AddContainerInput!
    molblock: String!
    name: String!
    description: String!
    attributes: [String]!
    storage: String!
    cas: String!
    registration_event: RegistrationEventInput!
  }

  input CompoundFilter {
    attributes: [String]
    storage: [String]
    substructure: SubstructureFilter
    container: ContainerFilter
    registration_event: RegistrationEventFilter
  }

  input SubstructureFilter {
    pattern: String
    removeHs: Boolean
  }

  input ExportCompoundDataInput {
    filter: CompoundFilter
    search: String
    search2: String!
    searchCategories: [String]!
    name: String!
    withSDS: Boolean
  }

  input UpdateCompoundInput {
    id: ID!
    name: String!
    description: String!
    attributes: [String]!
    storage: String!
    cas: String!
  }

  input CurateStructureInput {
    batch_id: String!
    molblock: String!
    author: String!
    reason: String!
    force: Boolean!
  }

  type ExactCompoundOutput {
    id: ID
    smiles: String!
    cas: String!
  }

  # Queries
  extend type Query {
    compoundInventory(filter: CompoundFilter, search: String, withSDS: Boolean): CompoundInventory!
    compound(id: ID!): Compound!
    compoundHints: CompoundHint!
  }

  # Mutations
  extend type Mutation {
    exportCompoundData(input: ExportCompoundDataInput!) : String
    exactCompound(molblock: String!, cas: String!): ExactCompoundOutput!
    smilesToMolBlock(smiles: String!) : String!
    molBlockToSmiles(molblock: String!) : String!

    #Create Mutations
    addCompound(input: AddCompoundInput!) : ID

    #Update Mutations
    updateCompound(input: UpdateCompoundInput!) : ID
    curateStructure(input: CurateStructureInput!) : Boolean

    #Delete Mutations
    deleteCompound(id: ID!) : Boolean
    deleteCompoundContainers(ids: [ID!]!, compoundID: ID!) : Boolean
  }
`;

export default () => [Compound, Container, Location, Document, Range, Registration];
