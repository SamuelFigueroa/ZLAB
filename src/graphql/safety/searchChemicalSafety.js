import gql from 'graphql-tag';

const SEARCH_CHEMICAL_SAFETY = gql`
  query searchChemicalSafety($compoundID: ID!) {
    searchChemicalSafety(compoundID: $compoundID) {
      id
      product_name
      manufacturer
      cas
    }
  }
`;

export default SEARCH_CHEMICAL_SAFETY;
