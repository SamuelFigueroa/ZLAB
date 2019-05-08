import gql from 'graphql-tag';

const UPDATE_EQUIPMENT_LOCATIONS = gql`
  mutation updateEquipmentLocations($ids: [ID!]!, $area: ID!, $sub_area: ID!) {
    updateEquipmentLocations(ids: $ids, area: $area, sub_area: $sub_area)
  }
`;

export default UPDATE_EQUIPMENT_LOCATIONS;
