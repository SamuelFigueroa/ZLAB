import gql from 'graphql-tag';

const DELETE_PURCHASE_EVENT = gql`
  mutation deletePurchaseEvent($ids: [ID!]!, $assetID: ID!) {
    deletePurchaseEvent(ids: $ids, assetID: $assetID)
  }
`;

export default DELETE_PURCHASE_EVENT;
