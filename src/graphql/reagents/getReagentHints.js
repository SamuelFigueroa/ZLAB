import gql from 'graphql-tag';

const GET_REAGENT_HINTS = gql`
  query getReagentHints {
    reagentHints {
      containers {
        vendor
        institution
        chemist
        solvent
      }
      attributes
      flags
      storage
    }
  }
`;

export default GET_REAGENT_HINTS;
