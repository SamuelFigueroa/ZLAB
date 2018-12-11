import gql from 'graphql-tag';

const GET_COMPOUNDS = gql`
  query getCompounds($filter: CompoundFilter, $search: String) {
    compounds(filter: $filter, search: $search) {
      id
      smiles
      molblock
      compound_id
      name
      description
      attributes
      flags
      storage
      cas
    }
  }
`;

export default GET_COMPOUNDS;
