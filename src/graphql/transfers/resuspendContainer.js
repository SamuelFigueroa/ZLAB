import gql from 'graphql-tag';

const RESUSPEND_CONTAINER = gql`
  mutation resuspendContainer($input: ResuspendInput!) {
    resuspend(input: $input)
  }
`;

export default RESUSPEND_CONTAINER;
