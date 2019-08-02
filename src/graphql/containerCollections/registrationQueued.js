import gql from 'graphql-tag';

const REGISTRATION_QUEUED = gql`
  subscription onRegistrationQueued {
    registrationQueued
  }
`;

export default REGISTRATION_QUEUED;
