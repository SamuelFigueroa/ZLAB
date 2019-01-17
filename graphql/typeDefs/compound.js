import { gql } from 'apollo-server-express';
import Document from './document';
import Location from './location';
import Registration from './registration';
import Range from './range';
import Container from './container';

const Compound = gql`

  type Compound {
    id: ID!
    containers: [Container]!
    smiles: String!
    molblock: String!
    compound_id: String!
    name: String!
    description: String!
    attributes: [String]!
    safety: ID
    flags: [String]!
    storage: String!
    cas: String!
    transfers: [TransferEvent]!
    curations: [CurationEvent]!
    registration_event: RegistrationEvent!
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
    flags: [String]!
    storage: [String]!
  }

  #INPUT

  input AddCompoundInput {
    container: AddContainerInput!
    molblock: String!
    name: String!
    description: String!
    attributes: [String]!
    flags: [String]!
    storage: String!
    cas: String!
    registration_event: RegistrationEventInput!
  }

  input CompoundFilter {
    attributes: [String]
    flags: [String]
    storage: [String]
    container: ContainerFilter
    registration_event: RegistrationEventFilter
  }

  input ExportCompoundDataInput {
    filter: CompoundFilter!
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
    flags: [String]!
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
    compounds(filter: CompoundFilter, search: String, withSDS: Boolean): [Compound]!
    compound(id: ID!): Compound!
    compoundHints: CompoundHint!
  }

  # Mutations
  extend type Mutation {
    exportCompoundData(input: ExportCompoundDataInput!) : String
    exactCompound(molblock: String!, cas: String!): ExactCompoundOutput!
    smilesToMolBlock(smiles: String!) : String!

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
