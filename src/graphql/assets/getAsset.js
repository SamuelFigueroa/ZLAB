import gql from 'graphql-tag';

const GET_ASSET = gql`
     query getAsset($id: ID!) {
      asset(id: $id) {
        id
        name
        barcode
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
        serial_number
        brand
        model
        purchasing_info {
          date
          supplier
          warranty_exp
          price
        }
        shared
        training_required
        grant {
          funding_agency
          grant_number
          project_name
        }
        maintenance_log {
          id
          date
          service
          agent
          scheduled
          description
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
        condition
        registration_event {
          user
          date
        }
      }
    }
`;



export default GET_ASSET;
