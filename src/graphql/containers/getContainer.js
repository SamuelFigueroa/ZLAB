import gql from 'graphql-tag';

const GET_CONTAINER = gql`
     query getContainer($id: ID!) {
      container(id: $id) {
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
          smiles
          molblock
          compound_id
          name
          description
          attributes
          flags
          storage
          cas
          safety
          registration_event {
            user
            date
          }
        }
      }
    }
`;

export default GET_CONTAINER;
