import gql from 'graphql-tag';

const UNQUEUE_CONTAINER_COLLECTION = gql`
  mutation unqueueContainerCollection($ids: [ID!]!) {
    unqueueContainerCollection(ids: $ids)
  }
`;

export default UNQUEUE_CONTAINER_COLLECTION;
