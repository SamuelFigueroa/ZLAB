import gql from 'graphql-tag';

const UPDATE_REAGENT = gql`
  mutation updateReagent($input: UpdateReagentInput!) {
    updateReagent(input: $input)
  }
`;

export default UPDATE_REAGENT;
