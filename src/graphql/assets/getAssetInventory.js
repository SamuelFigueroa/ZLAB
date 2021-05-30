import gql from 'graphql-tag';

const GET_ASSET_INVENTORY = gql`
  query getAssetInventory($filter: AssetFilter, $search: String, $first: Int, $last: Int, $after: String, $before: String) {
    assetInventory(filter: $filter, search: $search) {
      assetsConnection(first: $first, last: $last, after: $after, before: $before) {
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
            name
            shared
            ...on Equipment {
              barcode
              brand
              model
              condition
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
            }
            ...on Supply {
              description
            }
          }
        }
      }
    }
  }
`;

export default GET_ASSET_INVENTORY;
