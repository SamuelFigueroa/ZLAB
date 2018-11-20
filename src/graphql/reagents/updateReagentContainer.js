import gql from 'graphql-tag';

const UPDATE_REAGENT_CONTAINER = gql`
  mutation updateReagentContainer($input: UpdateReagentContainerInput!) {
    updateReagentContainer(input: $input)
  }
`;

export default UPDATE_REAGENT_CONTAINER;
