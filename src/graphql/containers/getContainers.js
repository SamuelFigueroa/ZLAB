import gql from 'graphql-tag';

const GET_CONTAINERS = gql`
  query getContainers($filter: CompoundFilter, $search: String) {
    containers(filter: $filter, search: $search) {
      id
      category
      barcode
      batch_id
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
      vendor
      catalog_id
      institution
      researcher
      eln_id
      mass
      mass_units
      volume
      vol_units
      concentration
      conc_units
      state
      content {
        id
        molblock
      }
    }
  }
`;

export default GET_CONTAINERS;
