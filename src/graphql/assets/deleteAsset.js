import gql from 'graphql-tag';

const DELETE_ASSET = gql`
  mutation deleteAsset($id: ID!) {
    deleteAsset(id: $id)
  }
`;

export default DELETE_ASSET;
