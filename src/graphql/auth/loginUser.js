import gql from 'graphql-tag';

const LOGIN_USER = gql`
  mutation loginUser($input: loginInput!) {
    login(input: $input) {
      token
      success
    }
  }
`;

export default LOGIN_USER;
