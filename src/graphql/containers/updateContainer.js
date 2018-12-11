import gql from 'graphql-tag';

const UPDATE_CONTAINER = gql`
  mutation updateContainer($input: UpdateContainerInput!) {
    updateContainer(input: $input)
  }
`;

export default UPDATE_CONTAINER;
