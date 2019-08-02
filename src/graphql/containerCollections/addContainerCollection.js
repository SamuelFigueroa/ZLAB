import gql from 'graphql-tag';

const ADD_CONTAINER_COLLECTION = gql`
  mutation addContainerCollection($input: AddContainerCollectionInput!) {
    addContainerCollection(input: $input) {
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

export default ADD_CONTAINER_COLLECTION;
