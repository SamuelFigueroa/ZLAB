import { gql } from 'apollo-server-express';
import Document from './document';
import Container from './container';

const Safety = gql`

  type SafetyDataSheet implements Node {
    id: ID!
    compound: Content!
    document: ID!
    sds_id: String!
    manufacturer: String!
    signal_word: String!
    pictograms: [String]!
    p_statements: [String]!
    h_statements: [String]!
  }

  type SafetyDataSheetsConnection {
    totalCount: Int!
    pageInfo: PageInfo!
    edges: [SafetyDataSheetsEdge]
  }

  type SafetyDataSheetsEdge {
    cursor: String!
    node: SafetyDataSheet
  }

  type SafetyDataSheetInventory {
    safetyDataSheetsConnection(
      first: Int,
      after: String,
      last: Int,
      before: String,
    ): SafetyDataSheetsConnection
  }

  type FullSafetyDataSheet {
    id: ID!
    compound: Content!
    document: ID!
    sds_id: String!
    manufacturer: String!
    signal_word: String!
    pictograms: [String]!
    p_statements: [P_Statement]!
    h_statements: [H_Statement]!
    h_classes: [String]!
  }

  type H_Statement {
    code: String!
    statement: String!
    type: String!
  }

  type P_Statement {
    code: String!
    statement: String!
    conditions: [String]!
    type: String!
  }

  type ChemicalSafetySearchResult {
    id: String!
    product_name: String!
    manufacturer: String!
    cas: String!
  }

  type SafetyDataSheetHint {
    manufacturer: [String]!
    signal_word: [String]!
    pictograms: [String]!
    h_class: [String]!
  }

  #INPUT

  input AddSafetyDataSheetInput {
    sds_id: String!
    compound: ID!
    upload: SDSUploadInput
    user: String!
  }

  input SDSUploadInput {
    file: Upload!
    name: String!
    size: String!
  }

  input SDSFilter {
    manufacturer: [String]
    signal_word: [String]
    pictograms: [String]
    h_class: [String]
  }

  input ExportCompoundSafetyDataInput {
    filter: SDSFilter
    search: String
    search2: String!
    searchCategories: [String]!
    name: String!
  }

  # Queries
  extend type Query {
    safetyDataSheets(filter: SDSFilter, search: String): SafetyDataSheetInventory!
    safetyDataSheet(id: ID!) : FullSafetyDataSheet!
    safetyDataSheetHints: SafetyDataSheetHint!
    searchChemicalSafety(compoundID: ID!) : [ChemicalSafetySearchResult]!
  }

  # Mutations
  extend type Mutation {
    exportCompoundSafetyData(input: ExportCompoundSafetyDataInput!) : String
    previewSafetyDataSheet(sds_id: String!) : String

    #Create Mutations
    addSafetyDataSheet(input: AddSafetyDataSheetInput!) : ID

    #Delete Mutations
    deleteSafetyDataSheet(id: ID!) : Boolean
  }
`;

export default () => [Safety, Document, Container];
