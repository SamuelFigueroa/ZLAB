import gql from 'graphql-tag';

const ADD_CHEMISTRY_QUERY_VARS = gql`
  mutation addChemistryQueryVariables($input: AddQueryVariablesInput!) {
    addQueryVariables(input: $input) @client
  }
`;

export default ADD_CHEMISTRY_QUERY_VARS;
