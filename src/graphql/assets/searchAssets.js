import gql from 'graphql-tag';

const SEARCH_ASSETS = gql`
     query searchAssets($search: String!) {
      searchAssets(search: $search) {
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
`;

export default SEARCH_ASSETS;
