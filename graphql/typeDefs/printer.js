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

  type PrinterHubOutput {
    response: String
  }

  # Queries
  extend type Query {
    printerHub(address: String!): PrinterHub
    onlinePrinterHubs : [PrinterHub]!
    printer(connection_name: String!) : Printer
    nextPrinterJob(connection_name: String!) : PrinterJob
  }

  # Mutations
  extend type Mutation {
    registerPrinterHub(input: PrinterHubInput!) : PrinterHubOutput!

    #Create Mutations
    addPrinter(input: AddPrinterInput!) : Boolean
    addPrinterJob(input: AddPrinterJobInput!) : Boolean

    #Update Mutations
    updatePrinter(input: UpdatePrinterInput!) : Boolean

    #Delete Mutations
    deletePrinterJob(input: DeletePrinterJobInput!) : Boolean
  }
`;

export default () => [Printer];
