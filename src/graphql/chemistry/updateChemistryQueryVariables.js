import gql from 'graphql-tag';

const UPDATE_CHEMISTRY_QUERY_VARS = gql`
  mutation updateChemistryQueryVariables($input: UpdateChemistryQueryVariablesInput!) {
    updateChemistryQueryVariables(input: $input) @client
  }
`;

export default UPDATE_CHEMISTRY_QUERY_VARS;
