import gql from 'graphql-tag';

const GET_EXACT_COMPOUND = gql`
  mutation getExactCompound($molblock: String!, $cas: String!) {
    exactCompound(molblock: $molblock, cas: $cas) {
      id
      smiles
      cas
    }
  }
`;

export default GET_EXACT_COMPOUND;
