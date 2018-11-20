import gql from 'graphql-tag';

const DELETE_REAGENT_CONTAINER = gql`
  mutation deleteReagentContainer($ids: [ID!]!, $reagentID: ID!) {
    deleteReagentContainer(ids: $ids, reagentID: $reagentID)
  }
`;

export default DELETE_REAGENT_CONTAINER;
