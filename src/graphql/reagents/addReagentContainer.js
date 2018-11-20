import gql from 'graphql-tag';

const ADD_REAGENT_CONTAINER = gql`
  mutation addReagentContainer($input: AddReagentContainerInput!) {
    addReagentContainer(input: $input)
  }
`;

export default ADD_REAGENT_CONTAINER;
