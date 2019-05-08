import gql from 'graphql-tag';

const ADD_SAFETY_QUERY_VARS = gql`
  mutation addSafetyQueryVariables($input: AddQueryVariablesInput!) {
    addQueryVariables(input: $input) @client
  }
`;

export default ADD_SAFETY_QUERY_VARS;
