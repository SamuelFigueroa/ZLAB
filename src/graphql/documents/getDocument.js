import gql from 'graphql-tag';

const GET_DOCUMENT = gql`
     query getDocument($id: ID!, $collection: String) {
      document(id: $id, collection: $collection)
    }
`;



export default GET_DOCUMENT;
