import { gql } from 'apollo-server-express';

const Printer = gql`

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

  type PrinterFormat {
    id: ID!
    name: String!
    zpl: String!
    defaults: PrinterFormatDefaults!
    fields: [PrinterFormatField]!
  }

  type PrinterFormatDefaults {
    labelWidth: Float!
    labelLength: Float!
    fieldOrientation: String
    fieldJustify: Int
    dotsPerMm: String
    reverse: Boolean
    mirror: Boolean
    labelOrientation: String
  }

  type PrinterFormatField {
    name: String!
    variable: Boolean!
    kind: String!
    data: String!
    originX: Int
    originY: Int
    justify: Int
    reverse: Boolean
    orientation: String
    fontHeight: Int
    fontWidth: Int
    direction: String
    gap: Int
    clockEnabled: Boolean
    clock: String
    hexEnabled: Boolean
    hexIndicator: String

    moduleWidth : Int
    barWidthRatio: Float
    height: Int
    barcode: String
    checkDigit: Boolean
    interpretation: Boolean
    interpretationAbove: Boolean

    moduleHeight: Int
    columns:Int
    rows: Int
    aspectRatio: Int

    operation: String
    format: String

    graphic: String
    thickness: Int
    color: String
    roundness: Int
    diameter: Int
    width: Int
    diagonalOrientation: String
    compression: String
    byteCount: Int
    fieldCount: Int
    bytesPerRow: Int
    graphicData: String
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

  input AddPrinterFormatInput {
    name: String!
    defaults: PrinterFormatDefaultsInput!
    fields: [PrinterFormatFieldInput]!
  }

  input PrinterFormatDefaultsInput {
    labelWidth: Float!
    labelLength: Float!
    fieldOrientation: String
    fieldJustify: Int
    dotsPerMm: String
    reverse: Boolean
    mirror: Boolean
    labelOrientation: String
  }

  input PrinterFormatFieldInput {
    name: String!
    variable: Boolean!
    kind: String!
    data: String!
    originX: Int
    originY: Int
    justify: Int
    reverse: Boolean
    orientation: String
    fontHeight: Int
    fontWidth: Int
    direction: String
    gap: Int
    clockEnabled: Boolean
    clock: String
    hexEnabled: Boolean
    hexIndicator: String

    moduleWidth : Int
    barWidthRatio: Float
    height: Int
    barcode: String
    checkDigit: Boolean
    interpretation: Boolean
    interpretationAbove: Boolean

    moduleHeight: Int
    columns:Int
    rows: Int
    aspectRatio: Int

    operation: String
    format: String

    graphic: String
    width: Int
    thickness: Int
    color: String
    roundness: Int
    diameter: Int
    diagonalOrientation: String
    compression: String
    byteCount: Int
    fieldCount: Int
    bytesPerRow: Int
    graphicData: String
  }

  input UpdatePrinterFormatInput {
    id: ID!
    name: String!
    defaults: PrinterFormatDefaultsInput!
    fields: [PrinterFormatFieldInput]!
  }

  type PrinterHubOutput {
    response: String
  }

  # Queries
  extend type Query {
    printers: [Printer]!
    printerHub(address: String!): PrinterHub
    onlinePrinterHubs : [PrinterHub]!
    printer(connection_name: String!) : Printer
    nextPrinterJob(connection_name: String!) : PrinterJob
    printerFormats: [PrinterFormat]!
    printerFormat(id: ID!) : PrinterFormat!
  }

  # Mutations
  extend type Mutation {
    registerPrinterHub(input: PrinterHubInput!) : PrinterHubOutput!

    #Create Mutations
    addPrinter(input: AddPrinterInput!) : Boolean
    addPrinterJob(input: AddPrinterJobInput!) : Boolean
    addPrinterFormat(input: AddPrinterFormatInput!) : Boolean

    #Update Mutations
    updatePrinter(input: UpdatePrinterInput!) : Boolean
    updatePrinterFormat(input: UpdatePrinterFormatInput!) : Boolean

    #Delete Mutations
    deletePrinterJob(input: DeletePrinterJobInput!) : Boolean
    deletePrinterFormat(ids: [ID!]!) : Boolean
  }
`;

export default () => [Printer];
