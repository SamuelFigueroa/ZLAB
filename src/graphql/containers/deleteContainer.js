import gql from 'graphql-tag';

const DELETE_CONTAINER = gql`
  mutation deleteContainer($id: ID!) {
    deleteContainer(id: $id)
  }
`;

export default DELETE_CONTAINER;
