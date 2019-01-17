import gql from 'graphql-tag';

const DELETE_SAFETY_DATA_SHEET = gql`
  mutation deleteSafetyDataSheet($id: ID!) {
    deleteSafetyDataSheet(id: $id)
  }
`;

export default DELETE_SAFETY_DATA_SHEET;
