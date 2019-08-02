import gql from 'graphql-tag';

const GET_CONTAINER_COLLECTIONS = gql`
  query getContainerCollections {
    containerCollections {
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

export default GET_CONTAINER_COLLECTIONS;
