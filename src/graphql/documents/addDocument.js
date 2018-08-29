import gql from 'graphql-tag';

const ADD_DOCUMENT = gql`
  mutation addDocument($input: AddDocumentInput!) {
    addDocument(input: $input)
  }
`;

export default ADD_DOCUMENT;
