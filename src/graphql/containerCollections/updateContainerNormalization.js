import gql from 'graphql-tag';

const UPDATE_CONTAINER_NORMALIZATION = gql`
  mutation updateContainerNormalization($input: UpdateContainerNormalizationInput!) {
    updateContainerNormalization(input: $input) @client
  }
`;

export default UPDATE_CONTAINER_NORMALIZATION;
