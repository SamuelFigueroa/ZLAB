import gql from 'graphql-tag';

const DELETE_CONTAINER_COLLECTION = gql`
  mutation deleteContainerCollection($ids: [ID!]!) {
    deleteContainerCollection(ids: $ids)
  }
`;

export default DELETE_CONTAINER_COLLECTION;
