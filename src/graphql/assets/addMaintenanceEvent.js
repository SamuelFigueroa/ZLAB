import gql from 'graphql-tag';

const ADD_MAINTENANCE_EVENT = gql`
  mutation addMaintenanceEvent($input: AddMaintenanceEventInput!) {
    addMaintenanceEvent(input: $input)
  }
`;

export default ADD_MAINTENANCE_EVENT;
