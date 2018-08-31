import gql from 'graphql-tag';

const CLEAR_DOCUMENT_CACHE = gql`
  mutation clearDocuments{
    clearDocuments
  }
`;

export default CLEAR_DOCUMENT_CACHE;
