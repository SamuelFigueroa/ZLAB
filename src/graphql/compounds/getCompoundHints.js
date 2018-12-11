import gql from 'graphql-tag';

const GET_COMPOUND_HINTS = gql`
  query getCompoundHints {
    compoundHints {
      attributes
      flags
      storage
    }
  }
`;

export default GET_COMPOUND_HINTS;
