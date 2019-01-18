import gql from 'graphql-tag';

const GET_SAFETY_DATA_SHEET = gql`
  query getSafetyDataSheet($id: ID!) {
    safetyDataSheet(id: $id) {
      id
      sds_id
      manufacturer
      signal_word
      pictograms
      h_classes
      h_statements {
        code
        statement
        type
      }
      p_statements {
        code
        statement
        conditions
        type
      }
      compound {
        id
        molblock
        name
        compound_id
        cas
      }
      document
    }
  }
`;

export default GET_SAFETY_DATA_SHEET;
