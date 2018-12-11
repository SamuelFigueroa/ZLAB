import gql from 'graphql-tag';

const DELETE_COMPOUND_CONTAINERS = gql`
  mutation deleteCompoundContainers($ids: [ID!]!, $compoundID: ID!) {
    deleteCompoundContainers(ids: $ids, compoundID: $compoundID)
  }
`;

export default DELETE_COMPOUND_CONTAINERS;
