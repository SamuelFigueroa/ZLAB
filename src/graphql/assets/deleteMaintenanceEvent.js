import gql from 'graphql-tag';

const DELETE_MAINTENANCE_EVENT = gql`
  mutation deleteMaintenanceEvent($ids: [ID!]!, $assetID: ID!) {
    deleteMaintenanceEvent(ids: $ids, assetID: $assetID)
  }
`;

export default DELETE_MAINTENANCE_EVENT;
