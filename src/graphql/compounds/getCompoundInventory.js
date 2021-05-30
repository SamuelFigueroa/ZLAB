import gql from 'graphql-tag';

const GET_COMPOUND_INVENTORY = gql`
  query getCompoundInventory($filter: CompoundFilter, $search: String, $withSDS: Boolean, $first: Int, $last: Int, $after: String, $before: String) {
    compoundInventory(filter: $filter, search: $search, withSDS: $withSDS) {
      compoundsConnection(first: $first, last: $last, after: $after, before: $before) {
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
            smiles
            molblock
            compound_id
            name
            description
            attributes
            storage
            cas
          }
        }
      }
    }
  }
`;

export default GET_COMPOUND_INVENTORY;
