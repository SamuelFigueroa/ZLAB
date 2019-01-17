import gql from 'graphql-tag';

const GET_SAFETY_DATA_SHEET_HINTS = gql`
  query getSafetyDataSheetHints {
    safetyDataSheetHints {
      pictograms
      manufacturer
      signal_word
      h_class
    }
  }
`;

export default GET_SAFETY_DATA_SHEET_HINTS;
