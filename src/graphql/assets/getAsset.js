import gql from 'graphql-tag';

const GET_ASSET = gql`
     query getAsset($id: ID!) {
      asset(id: $id) {
        id
        name
        description
        category
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
        training_required
        grant {
          funding_agency
          grant_number
          project_name
        }
        documents {
          id
          name
          size
          category
          uploaded_by
          upload_date
        }
        users
        registration_event {
          user
          date
        }
        ...on Equipment {
          barcode
          serial_number
          brand
          model
          condition
          purchasing_info {
            date
            supplier
            warranty_exp
            price
          }
          maintenance_log {
            id
            date
            service
            agent
            scheduled
            description
          }
        }
        ... on Supply {
          purchase_log {
            id
            date
            price
            catalog_number
            supplier
            received
            quantity
          }
        }
      }
    }
`;



export default GET_ASSET;
