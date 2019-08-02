import gql from 'graphql-tag';

const CONTAINER_REGISTERED = gql`
  subscription onContainerRegistered {
    containerRegistered {
      registered
      errored
      collectionID
    }
  }
`;

export default CONTAINER_REGISTERED;
