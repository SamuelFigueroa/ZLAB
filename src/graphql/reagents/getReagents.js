import gql from 'graphql-tag';

const GET_REAGENTS = gql`
  query getReagents($filter: ReagentFilter, $search: String) {
    reagents(filter: $filter, search: $search) {
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

export default GET_REAGENTS;
