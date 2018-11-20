import gql from 'graphql-tag';

const GET_REAGENT = gql`
     query getReagent($id: ID!) {
      reagent(id: $id) {
        id
        smiles
        molblock
        compound_id
        name
        description
        attributes
        flags
        storage
        cas
        registration_event {
          user
          date
        }
        safety {
          id
          name
          size
          category
          uploaded_by
          upload_date
        }
        containers {
          id
          barcode
          vendor
          catalog_id
          institution
          chemist
          state
          mass
          mass_units
          volume
          vol_units
          concentration
          conc_units
          solvent
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
          owner
          description
          registration_event {
            user
            date
          }
        }
      }
    }
`;



export default GET_REAGENT;
