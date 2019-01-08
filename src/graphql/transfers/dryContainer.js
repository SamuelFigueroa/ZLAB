import gql from 'graphql-tag';

const DRY_CONTAINER = gql`
  mutation dryContainer($input: DryInput!) {
    dry(input: $input)
  }
`;

export default DRY_CONTAINER;
