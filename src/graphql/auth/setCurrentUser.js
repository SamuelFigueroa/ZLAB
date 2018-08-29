import gql from 'graphql-tag';

const SET_CURRENT_USER = gql`
  mutation setCurrentUser($payload: Payload!) {
    setCurrentUser(payload: $payload) @client
  }
`;

export default SET_CURRENT_USER;
