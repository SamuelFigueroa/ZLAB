import gql from 'graphql-tag';

const GET_SAFETY_DATA_SHEETS = gql`
  query getSafetyDataSheets($filter: SDSFilter, $search: String) {
    safetyDataSheets(filter: $filter, search: $search) {
      id
      sds_id
      manufacturer
      signal_word
      pictograms
      compound {
        id
        molblock
        name
        compound_id
      }
    }
  }
`;

export default GET_SAFETY_DATA_SHEETS;
