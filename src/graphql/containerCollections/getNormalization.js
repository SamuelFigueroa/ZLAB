import gql from 'graphql-tag';

const GET_NORMALIZATION = gql`
  query getNormalization($collectionID: ID!) {
    normalization(collectionID: $collectionID) @client(always: true) {
      id
      containerFieldsNormalized
      locationsNormalized
      usersNormalized
    }
  }
`;

export default GET_NORMALIZATION;
