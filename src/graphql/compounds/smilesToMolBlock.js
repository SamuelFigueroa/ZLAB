import gql from 'graphql-tag';

const SMILES_TO_MOLBLOCK = gql`
  mutation smilesToMolBlock($smiles: String!) {
    smilesToMolBlock(smiles: $smiles)
  }
`;

export default SMILES_TO_MOLBLOCK;
