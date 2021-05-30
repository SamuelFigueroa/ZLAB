import gql from 'graphql-tag';

const GET_SAFETY_QUERY_VARS = gql`
  query getSafetyQueryVariables($id: String!) {
    safetyQueryVariables(id: $id) @client(always:true) {
      id
      filter {
        manufacturer
        signalWord
        pictograms
        hClass
      }
      search
      search2
      searchCategories
      filterOn
      cached
      resultsCount
      pagination {
        page
        first
        last
        before
        after
      }
    }
  }
`;

export default GET_SAFETY_QUERY_VARS;
