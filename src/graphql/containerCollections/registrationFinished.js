import gql from 'graphql-tag';

const REGISTRATION_FINISHED = gql`
  subscription onRegistrationFinished {
    registrationFinished
  }
`;

export default REGISTRATION_FINISHED;
