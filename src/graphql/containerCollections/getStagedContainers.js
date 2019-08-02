import gql from 'graphql-tag';

const GET_STAGED_CONTAINERS = gql`
  query getStagedContainers($collectionID: ID!, $offset: Int!, $limit: Int!) {
    stagedContainers(collectionID: $collectionID, offset: $offset, limit: $limit) {
      id
      category
      barcode
      location {
        area
        sub_area
      }
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
      content {
        molblock
        cas
      }
    }
  }
`;

export default GET_STAGED_CONTAINERS;
