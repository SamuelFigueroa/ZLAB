import gql from 'graphql-tag';

const DELETE_COMPOUND = gql`
  mutation deleteCompound($id: ID!) {
    deleteCompound(id: $id)
  }
`;

export default DELETE_COMPOUND;
