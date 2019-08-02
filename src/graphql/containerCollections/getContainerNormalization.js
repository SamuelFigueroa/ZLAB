import gql from 'graphql-tag';

const GET_CONTAINER_NORMALIZATION = gql`
  query getContainerNormalization($collectionID: ID!) {
    containerNormalization(collectionID: $collectionID) {
      id
      field
      unregistered
      registerAs
    }
  }
`;

export default GET_CONTAINER_NORMALIZATION;
