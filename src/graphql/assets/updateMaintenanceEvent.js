import gql from 'graphql-tag';

const UPDATE_MAINTENANCE_EVENT = gql`
  mutation updateMaintenanceEvent($input: UpdateMaintenanceEventInput!) {
    updateMaintenanceEvent(input: $input)
  }
`;

export default UPDATE_MAINTENANCE_EVENT;
