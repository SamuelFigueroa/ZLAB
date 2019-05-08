import gql from 'graphql-tag';

const UPDATE_ASSET_QUERY_VARS = gql`
  mutation updateAssetQueryVariables($input: UpdateAssetQueryVariablesInput!) {
    updateAssetQueryVariables(input: $input) @client
  }
`;

export default UPDATE_ASSET_QUERY_VARS;
