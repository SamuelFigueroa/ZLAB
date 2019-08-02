import gql from 'graphql-tag';

const UPDATE_USER_NORMALIZATION = gql`
  mutation updateUserNormalization($input: UpdateUserNormalizationInput!) {
    updateUserNormalization(input: $input) @client
  }
`;

export default UPDATE_USER_NORMALIZATION;
