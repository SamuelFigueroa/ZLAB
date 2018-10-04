import gql from 'graphql-tag';

const UPDATE_ASSET = gql`
  mutation updateAsset($input: UpdateAssetInput!) {
    updateAsset(input: $input)
  }
`;

export default UPDATE_ASSET;
