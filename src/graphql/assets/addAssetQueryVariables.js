import gql from 'graphql-tag';

const ADD_ASSET_QUERY_VARS = gql`
  mutation addAssetQueryVariables($input: AddQueryVariablesInput!) {
    addQueryVariables(input: $input) @client
  }
`;

export default ADD_ASSET_QUERY_VARS;
