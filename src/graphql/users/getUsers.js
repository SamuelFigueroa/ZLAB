import gql from 'graphql-tag';

const GET_USERS = gql`
     {
      users {
        id
        email
        login
        name
        admin
      }
    }
`;



export default GET_USERS;
