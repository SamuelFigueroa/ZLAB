import gql from 'graphql-tag';

const UPDATE_LOCATION_NORMALIZATION = gql`
  mutation updateLocationNormalization($input: UpdateLocationNormalizationInput!) {
    updateLocationNormalization(input: $input) @client
  }
`;

export default UPDATE_LOCATION_NORMALIZATION;
