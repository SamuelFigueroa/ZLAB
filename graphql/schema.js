import { gql } from 'apollo-server-express';

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.

  # Server-side types
  type User {
    id: ID!
    email: String!
    login: String!
    name: String!
    admin: Boolean!
  }

  type Asset {
    id: ID!
    name: String!
    barcode: String!
    description: String!
    category: String!
    location: Location!
    serial_number: String!
    brand: String!
    model: String!
    condition: String!
    shared: String!
    purchasing_info: PurchasingInfo!
    grant: Grant!
    maintenance_log: [MaintenanceEvent]!
    documents: [Document]!
    users: [ID]!
    training_required: String!
    registration_event: RegistrationEvent!
  }

  type Document {
    id: ID!
    name: String!
    size: String!
    category: String!
    uploaded_by: String!
    upload_date: String!
  }

  type RegistrationEvent {
    user: String!
    date: String!
  }

  type MaintenanceEvent {
    id: ID!
    date: String!
    service: String!
    agent: String!
    scheduled: String!
    description: String!
  }

  type Grant {
    funding_agency: String!
    grant_number: String!
    project_name: String!
  }

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

  type PurchasingInfo {
    date: String!
    supplier: String!
    warranty_exp: String!
    price: Float!
  }

  type File {
    id: ID!
    path: String!
    filename: String!
    mimetype: String!
    encoding: String!
  }

  input AddUserInput {
    email: String!
    login: String!
    name: String!
    password: String!
    password2: String!
    admin: Boolean!
  }

  input loginInput {
    login: String!
    password: String!
  }

  input PurchasingInfoInput {
    date: String!
    supplier: String!
    warranty_exp: String!
    price: Float!
  }

  input GrantInput {
    funding_agency: String!
    grant_number: String!
    project_name: String!
  }

  input RegistrationEventInput {
    user: String!
  }

  input AddAssetInput {
    name: String!
    barcode: String!
    description: String!
    category: String!
    location: LocationInput!
    serial_number: String!
    brand: String!
    model: String!
    purchasing_info: PurchasingInfoInput!
    shared: String!
    grant: GrantInput!
    users: [ID]!
    training_required: String!
    condition: String!
    registration_event: RegistrationEventInput!
  }

  input updateAssetInput {
    id: ID!
    name: String!
    barcode: String!
    description: String!
    category: String!
    location: LocationInput!
    serial_number: String!
    brand: String!
    model: String!
    purchasing_info: PurchasingInfoInput!
    shared: String!
    training_required: String!
    grant: GrantInput!
    users: [ID]!
    condition: String!
  }

  input AddMaintenanceEventInput {
    assetID: ID!
    date: String!
    service: String!
    agent: String!
    scheduled: String!
    description: String!
  }

  input LocationInput {
    area: ID!
    sub_area: ID!
  }

  input AddLocationInput {
    area: String!
    sub_area: String!
  }

  input AddDocumentInput {
    file: Upload!
    name: String!
    size: String!
    user: String!
    category: String!
    model: String!
    field: String
    docID: ID!
  }

  type loginOutput {
    success: Boolean
    token: String
  }

  #Client-side types

  type Auth {
    user: UserPayload!
    isAuthenticated: Boolean!
  }

  input Payload {
    exp: Int!
    iat: Int!
    login: String!
    name: String!
    email: String!
    admin: Boolean!
  }

  type UserPayload {
    exp: Int
    iat: Int
    login: String
    name: String
    email: String
    admin: Boolean
  }

  type Error {
    key: String
    message: String
  }

  input ErrorInput {
    key: String,
    message: String
  }

  input UploadInput {
    name: String!
    size: String!
  }

  # Queries
  type Query {
    auth: Auth!
    getCurrentUser : UserPayload
    errors: [Error]!
    assets: [Asset]!
    asset(id: ID!): Asset!
    locations: [LocationObject]!
    users: [User]!
    #location(areaID: ID!, subAreaID: ID!): Location!
  }

  # Mutations
  type Mutation {
    login(input: loginInput!) : loginOutput!
    validateUpload(input: UploadInput!) : Boolean

    #Create Mutations
    addUser(input: AddUserInput!) : Boolean
    addAsset(input: AddAssetInput!) : Boolean
    addLocation(input: AddLocationInput!) : Boolean
    addMaintenanceEvent(input: AddMaintenanceEventInput!) : Boolean
    addDocument(input: AddDocumentInput!): Boolean

    #Update Mutations
    updateAsset(input: updateAssetInput!) : Boolean


    #Delete Mutations
    deleteAsset(id: ID!) : Boolean


    setCurrentUser(payload: Payload!) : Boolean
    setErrors(errors: [ErrorInput]!) : Boolean
  }
`;

export default typeDefs;
