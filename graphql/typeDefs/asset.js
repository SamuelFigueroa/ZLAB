import { gql } from 'apollo-server-express';
import Document from './document';
import Location from './location';
import Registration from './registration';
import Range from './range';

const Asset = gql`

  interface Asset {
    id: ID!
    name: String!
    description: String!
    category: String!
    shared: String!
    documents: [Document]!
    registration_event: RegistrationEvent!
  }

  type Equipment implements Asset {
    id: ID!
    name: String!
    barcode: String
    description: String!
    category: String!
    location: Location
    serial_number: String
    brand: String
    model: String
    condition: String
    shared: String!
    purchasing_info: PurchasingInfo
    grant: Grant
    maintenance_log: [MaintenanceEvent]
    documents: [Document]!
    users: [ID]
    training_required: String
    registration_event: RegistrationEvent!
  }

  type Supply implements Asset {
    id: ID!
    name: String!
    description: String!
    category: String!
    shared: String!
    purchase_log: [PurchaseEvent]
    documents: [Document]!
    registration_event: RegistrationEvent!
  }

  type Grant {
    funding_agency: String!
    grant_number: String!
    project_name: String!
  }

  type PurchasingInfo {
    date: String!
    supplier: String!
    warranty_exp: String
    price: Float!
  }

  type MaintenanceEvent {
    id: ID!
    date: String!
    service: String!
    agent: String!
    scheduled: String
    description: String!
  }

  type PurchaseEvent {
    id: ID!
    date: String!
    price: Float!
    supplier: String!
    catalog_number: String!
    received: String
    quantity: Float!
  }

  type AssetSearchResult {
    category: String!
    results: [Asset]!
  }

  type AssetHint {
    brand: [String]!
    model: [String]!
    purchasing_info: PurchasingInfoHint!
    grant: GrantHint!
    maintenance_log: MaintenanceLogHint!
    purchase_log: PurchaseLogHint!
  }

  type MaintenanceLogHint {
    agent:[String]!
  }

  type PurchaseLogHint {
    supplier:[String]!
  }

  type PurchasingInfoHint {
    supplier: [String]!
  }

  type GrantHint {
    funding_agency: [String]!
    grant_number: [String]!
    project_name: [String]!
  }

  #INPUT

  input AddAssetInput {
    name: String!
    description: String!
    category: String!
    location: LocationInput
    serial_number: String
    brand: String
    model: String
    purchasing_info: PurchasingInfoInput
    shared: String!
    grant: GrantInput
    users: [ID]
    training_required: String
    condition: String
    registration_event: RegistrationEventInput!
  }

  input PurchasingInfoInput {
    date: String!
    supplier: String!
    warranty_exp: String!
    price: Float
  }

  input GrantInput {
    funding_agency: String!
    grant_number: String!
    project_name: String!
  }

  input AssetFilter {
    category: String
    location: [ID]
    brand: [String]
    model: [String]
    condition: [String]
    shared: [String]
    purchasing_info: PurchasingInfoFilter
    grant: GrantFilter
    maintenance_log: MaintenanceEventFilter
    purchase_log: PurchaseEventFilter
    users: [ID]
    training_required: [String]
    registration_event: RegistrationEventFilter
  }

  input PurchasingInfoFilter {
    supplier: [String]
    price: NumberRange
    date: DateRange
    warranty_exp: DateRange
  }

  input GrantFilter {
    funding_agency: [String]
    grant_number: [String]
    project_name: [String]
  }

  input MaintenanceEventFilter {
    service: [String]
    agent: [String]
    date: DateRange
    scheduled: DateRange
  }

  input PurchaseEventFilter {
    price: NumberRange
    supplier: [String]
    date: DateRange
    received: DateRange
  }

  input UpdateAssetInput {
    id: ID!
    name: String!
    description: String!
    category: String!
    location: LocationInput
    serial_number: String
    brand: String
    model: String
    purchasing_info: PurchasingInfoInput
    shared: String!
    training_required: String
    grant: GrantInput
    users: [ID]
    condition: String
  }

  input AddMaintenanceEventInput {
    assetID: ID!
    date: String!
    service: String!
    agent: String!
    scheduled: String!
    description: String!
  }

  input AddPurchaseEventInput {
    assetID: ID!
    date: String!
    price: Float
    supplier: String!
    catalog_number: String!
    received: String!
    quantity: Float!
  }

  input UpdateMaintenanceEventInput {
    assetID: ID!
    eventID: ID!
    date: String!
    service: String!
    agent: String!
    scheduled: String!
    description: String!
  }

  input UpdatePurchaseEventInput {
    assetID: ID!
    eventID: ID!
    date: String!
    price: Float
    supplier: String!
    catalog_number: String!
    received: String!
    quantity: Float!
  }

  input ExportAssetDataInput {
    filter: AssetFilter!
    search: String
    search2: String!
    searchCategories: [String]!
    name: String!
  }

  # Queries
  extend type Query {
    assets(filter: AssetFilter, search: String): [AssetSearchResult]!
    asset(id: ID!): Asset!
    assetHints(category: String!): AssetHint!
  }

  # Mutations
  extend type Mutation {
    exportAssetData(input: ExportAssetDataInput!) : String

    #Create Mutations
    addAsset(input: AddAssetInput!) : Boolean

    #Update Mutations
    addMaintenanceEvent(input: AddMaintenanceEventInput!) : Boolean
    addPurchaseEvent(input: AddPurchaseEventInput!) : Boolean
    updateAsset(input: UpdateAssetInput!) : Boolean
    updateMaintenanceEvent(input: UpdateMaintenanceEventInput!) : Boolean
    updatePurchaseEvent(input: UpdatePurchaseEventInput!) : Boolean

    #Delete Mutations
    deleteAsset(id: ID!) : Boolean
    deleteMaintenanceEvent(ids: [ID!]!, assetID: ID!) : Boolean
    deletePurchaseEvent(ids: [ID!]!, assetID: ID!) : Boolean
  }
`;

export default () => [Asset, Document, Location, Registration, Range];
