import gql from 'graphql-tag';

const MOLBLOCK_TO_SMILES = gql`
  mutation molBlockToSmiles($molblock: String!) {
    molBlockToSmiles(molblock: $molblock)
  }
`;

export default MOLBLOCK_TO_SMILES;
