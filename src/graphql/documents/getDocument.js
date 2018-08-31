import gql from 'graphql-tag';

const GET_DOCUMENT = gql`
     query getDocument($id: ID!) {
      document(id: $id)
    }
`;



export default GET_DOCUMENT;
