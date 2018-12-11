import gql from 'graphql-tag';

const ADD_CONTAINER = gql`
  mutation addContainer($input: AddContainerInput!) {
    addContainer(input: $input)
  }
`;

export default ADD_CONTAINER;
