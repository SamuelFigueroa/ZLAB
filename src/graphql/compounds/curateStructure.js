import gql from 'graphql-tag';

const CURATE_STRUCTURE = gql`
  mutation curateStructure($input: CurateStructureInput!) {
    curateStructure(input: $input)
  }
`;

export default CURATE_STRUCTURE;
