import gql from 'graphql-tag';

const GET_ASSETS = gql`
     {
      assets {
        id
        name
        barcode
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
        brand
        model
        shared
        condition
      }
    }
`;



export default GET_ASSETS;
