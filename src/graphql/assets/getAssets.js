import gql from 'graphql-tag';

const GET_ASSETS = gql`
     query getAssets($category: String!) {
      assets(category: $category) {
        id
        name
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
        shared
        ...on Equipment {
          barcode
          brand
          model
          condition
        }
        ...on Supply {
          description
        }
      }
    }
`;



export default GET_ASSETS;
