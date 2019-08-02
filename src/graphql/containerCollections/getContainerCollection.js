import gql from 'graphql-tag';

const GET_CONTAINER_COLLECTION = gql`
  query getContainerCollection($id: ID!) {
    containerCollection(id: $id) {
      id
      name
      user
      size
      status
      createdAt
      updatedAt
    }
  }
`;

export default GET_CONTAINER_COLLECTION;
