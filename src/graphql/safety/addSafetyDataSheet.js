import gql from 'graphql-tag';

const ADD_SAFETY_DATA_SHEET = gql`
  mutation addSafetyDataSheet($input: AddSafetyDataSheetInput!) {
    addSafetyDataSheet(input: $input)
  }
`;

export default ADD_SAFETY_DATA_SHEET;
