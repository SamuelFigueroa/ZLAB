import gql from 'graphql-tag';

const GET_USER_NORMALIZATION = gql`
  query getUserNormalization($collectionID: ID!) {
    userNormalization(collectionID: $collectionID) {
      id
      field
      unregistered
      registerAs
    }
  }
`;

export default GET_USER_NORMALIZATION;
