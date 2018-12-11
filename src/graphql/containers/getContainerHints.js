import gql from 'graphql-tag';

const GET_CONTAINER_HINTS = gql`
  query getContainerHints {
    containerHints {
      vendor
      institution
      researcher
      solvent
    }
  }
`;

export default GET_CONTAINER_HINTS;
