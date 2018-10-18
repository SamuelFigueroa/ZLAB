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
    warranty_exp: String
    price: Float!
  }

  type PrinterHub {
    id: ID!
    name: String!
    address: String!
    online: Boolean!
    user: String!
  }

  type Printer {
    id: ID!
    name: String!
    connection_name: String!
    queue: Boolean!
    jobs: [PrinterJob]!
  }

  type PrinterJob {
    id: ID!
    name: String!
    data: String!
    time_added: String!
    status: String!
  }

  input AssetFilter {
    category: String!
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
    price: Range
    date: DateRange
    warranty_exp: DateRange
  }

  input DateRange {
    min: String,
    max: String
  }
  input Range {
    min: Float
    max: Float
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
    price: Range
    supplier: [String]
    date: DateRange
    received: DateRange
  }

  input RegistrationEventFilter {
    user: [String]
    date: DateRange
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
    price: Float
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
    objID: ID!
  }

  input PrinterHubInput {
    name: String!
    address: String!
    online: Boolean!
  }

  input AddPrinterInput {
    name: String!
    connection_name: String!
  }

  input UpdatePrinterInput {
    connection_name: String!
    queue: Boolean!
    reset: Boolean!
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

  input AddPrinterJobInput {
    connection_name: String!
    job: PrinterJobInput!
  }

  input PrinterJobInput {
    name: String!
    data: String!
    time_added: String!
  }

  input DeletePrinterJobInput {
    connection_name: String!
    jobID: ID!
    dequeue: Boolean!
  }

  input AddCounterInput {
    name: String!
    prefix: String!
  }

  input ExportAssetDataInput {
    filter: AssetFilter!
    searchCategories: [String]!
    search: String!
    name: String!
  }

  type loginOutput {
    success: Boolean
    token: String
  }

  type PrinterHubOutput {
    response: String
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
    assets(input: AssetFilter!): [Asset]!
    asset(id: ID!): Asset!
    document(id: ID!): String
    locations: [LocationObject]!
    users: [User]!
    printerHub(address: String!): PrinterHub
    onlinePrinterHubs : [PrinterHub]!
    printer(connection_name: String!) : Printer
    nextPrinterJob(connection_name: String!) : PrinterJob
    #location(areaID: ID!, subAreaID: ID!): Location!
    assetHints(category: String!): AssetHint!
    searchAssets(search: String!): [Asset]!
  }

  # Mutations
  type Mutation {
    login(input: loginInput!) : loginOutput!
    validateUpload(input: UploadInput!) : Boolean
    registerPrinterHub(input: PrinterHubInput!) : PrinterHubOutput!
    updateAssetBarcodes : Boolean
    updateDates : Boolean
    exportAssetData(input: ExportAssetDataInput!) : String

    #Create Mutations
    addUser(input: AddUserInput!) : Boolean
    addAsset(input: AddAssetInput!) : Boolean
    addLocation(input: AddLocationInput!) : Boolean
    addMaintenanceEvent(input: AddMaintenanceEventInput!) : Boolean
    addPurchaseEvent(input: AddPurchaseEventInput!) : Boolean
    addDocument(input: AddDocumentInput!) : Boolean
    addPrinter(input: AddPrinterInput!) : Boolean
    addPrinterJob(input: AddPrinterJobInput!) : Boolean
    addCounter(input: AddCounterInput!) : Boolean

    #Update Mutations
    updateAsset(input: UpdateAssetInput!) : Boolean
    updatePrinter(input: UpdatePrinterInput!) : Boolean
    updateMaintenanceEvent(input: UpdateMaintenanceEventInput!) : Boolean
    updatePurchaseEvent(input: UpdatePurchaseEventInput!) : Boolean

    #Delete Mutations
    deleteAsset(id: ID!) : Boolean
    deleteDocument(ids: [ID!]!, assetID: ID!) : Boolean
    clearDocuments : Boolean
    deleteMaintenanceEvent(ids: [ID!]!, assetID: ID!) : Boolean
    deletePurchaseEvent(ids: [ID!]!, assetID: ID!) : Boolean
    deletePrinterJob(input: DeletePrinterJobInput!) : Boolean

    setCurrentUser(payload: Payload!) : Boolean
    setErrors(errors: [ErrorInput]!) : Boolean
  }
`;

export default typeDefs;
