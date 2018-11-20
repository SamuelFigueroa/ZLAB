import gql from 'graphql-tag';

const ADD_REAGENT = gql`
  mutation addReagent($input: AddReagentInput!) {
    addReagent(input: $input)
  }
`;

export default ADD_REAGENT;
