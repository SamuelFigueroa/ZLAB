import gql from 'graphql-tag';

const UPDATE_SAFETY_QUERY_VARS = gql`
  mutation updateSafetyQueryVariables($input: UpdateSafetyQueryVariablesInput!) {
    updateSafetyQueryVariables(input: $input) @client
  }
`;

export default UPDATE_SAFETY_QUERY_VARS;
