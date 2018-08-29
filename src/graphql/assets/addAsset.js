import gql from 'graphql-tag';

const ADD_ASSET = gql`
  mutation addAsset($input: AddAssetInput!) {
    addAsset(input: $input)
  }
`;

export default ADD_ASSET;
