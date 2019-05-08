import gql from 'graphql-tag';

const EQUIPMENT_INVENTORIZED = gql`
  subscription onEquipmentInventorized {
    equipmentInventorized {
      id
      name
      description
      category
      shared
      documents {
        id
        name
        size
        category
        uploaded_by
        upload_date
      }
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
        training_required
        grant {
          funding_agency
          grant_number
          project_name
        }
        users
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
    }
  }
`;

export default EQUIPMENT_INVENTORIZED;
