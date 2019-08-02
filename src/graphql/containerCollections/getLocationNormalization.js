import gql from 'graphql-tag';

const GET_LOCATION_NORMALIZATION = gql`
  query getLocationNormalization($collectionID: ID!) {
    locationNormalization(collectionID: $collectionID) {
      id
      field
      unregistered {
        area
        sub_area
      }
      registerAs {
        area
        sub_area
      }
    }
  }
`;

export default GET_LOCATION_NORMALIZATION;
