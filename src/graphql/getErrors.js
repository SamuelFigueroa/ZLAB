import gql from 'graphql-tag';

const GET_ERRORS = gql`
 {
    errors @client {
      key
      message
    }
  }
`;

export default GET_ERRORS;
