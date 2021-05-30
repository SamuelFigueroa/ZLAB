import gql from 'graphql-tag';

const GET_SAFETY_DATA_SHEETS = gql`
  query getSafetyDataSheets($filter: SDSFilter, $search: String, $first: Int, $last: Int, $after: String, $before: String) {
    safetyDataSheets(filter: $filter, search: $search) {
      safetyDataSheetsConnection(first: $first, last: $last, after: $after, before: $before) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        edges {
          node {
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
      }
    }
  }
`;

export default GET_SAFETY_DATA_SHEETS;
