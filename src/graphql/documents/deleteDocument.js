import gql from 'graphql-tag';

const DELETE_DOCUMENT = gql`
  mutation deleteDocument($ids: [ID!]!, $assetID: ID!) {
    deleteDocument(ids: $ids, assetID: $assetID)
  }
`;

export default DELETE_DOCUMENT;
