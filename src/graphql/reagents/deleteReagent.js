import gql from 'graphql-tag';

const DELETE_REAGENT = gql`
  mutation deleteReagent($id: ID!) {
    deleteReagent(id: $id)
  }
`;

export default DELETE_REAGENT;
