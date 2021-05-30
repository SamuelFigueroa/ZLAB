import gql from 'graphql-tag';

const GET_CONTAINER_INVENTORY = gql`
  query getContainerInventory($filter: CompoundFilter, $search: String, $first: Int, $last: Int, $after: String, $before: String) {
    containerInventory(filter: $filter, search: $search) {
      containersConnection(first: $first, last: $last, after: $after, before: $before) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        edges {
          node {
            id
            category
            barcode
            batch_id
            location {
              area {
                id
                name
              }
              sub_area {
                id
                name
              }
            }
            vendor
            catalog_id
            institution
            researcher
            eln_id
            mass
            mass_units
            volume
            vol_units
            concentration
            conc_units
            state
            content {
              id
              molblock
            }
          }
        }
      }
    }
  }
`;

export default GET_CONTAINER_INVENTORY;
