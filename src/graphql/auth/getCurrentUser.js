import gql from 'graphql-tag';

const GET_CURRENT_USER = gql`
    {
      auth @client {
        user {
          exp
          iat
          login
          name
          email
          admin
        }
        isAuthenticated
      }
    }
`;

export default GET_CURRENT_USER;
