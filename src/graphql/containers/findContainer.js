import gql from 'graphql-tag';

const FIND_CONTAINER = gql`
     query findContainer($barcode: String!) {
      barcodedContainer(barcode: $barcode) {
        id
        category
        batch_id
        barcode
        vendor
        catalog_id
        institution
        researcher
        eln_id
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
        content {
          id
          molblock
        }
      }
    }
`;

export default FIND_CONTAINER;
