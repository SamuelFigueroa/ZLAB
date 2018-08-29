import gql from 'graphql-tag';

const REGISTER_USER = gql`
  mutation registerUser($input: AddUserInput!) {
    addUser(input: $input)
  }
`;

export default REGISTER_USER;
