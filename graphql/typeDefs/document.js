import { gql } from 'apollo-server-express';

const Document = gql`

  type Document {
    id: ID!
    name: String!
    size: String!
    category: String!
    uploaded_by: String!
    upload_date: String!
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

  input UploadInput {
    name: String!
    size: String!
  }

  # Queries
  extend type Query {
    document(id: ID!): String
  }

  # Mutations
  extend type Mutation {
    validateUpload(input: UploadInput!) : Boolean

    #Create Mutations
    addDocument(input: AddDocumentInput!) : Boolean

    #Delete Mutations
    deleteDocument(ids: [ID!]!, assetID: ID!) : Boolean
    clearDocuments : Boolean
  }
`;

export default () => [Document];
