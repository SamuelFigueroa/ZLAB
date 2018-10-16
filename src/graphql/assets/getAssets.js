import gql from 'graphql-tag';

const GET_ASSETS = gql`
     query getAssets($input: AssetFilter!) {
      assets(input: $input) {
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
          purchasing_info {
            date
            supplier
            warranty_exp
            price
          }
          grant {
            funding_agency
            grant_number
            project_name
          }
          maintenance_log {
            service
            agent
            scheduled
            date
          }
          training_required
          registration_event {
            user
            date
          }
        }
        ...on Supply {
          description
        }
      }
    }
`;



export default GET_ASSETS;
