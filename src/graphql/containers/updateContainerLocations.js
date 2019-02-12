import gql from 'graphql-tag';

const UPDATE_CONTAINER_LOCATIONS = gql`
  mutation updateContainerLocations($ids: [ID!]!, $area: ID!, $sub_area: ID!) {
    updateContainerLocations(ids: $ids, area: $area, sub_area: $sub_area)
  }
`;

export default UPDATE_CONTAINER_LOCATIONS;
