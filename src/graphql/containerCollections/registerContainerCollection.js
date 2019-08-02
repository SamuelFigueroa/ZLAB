import gql from 'graphql-tag';

const REGISTER_CONTAINER_COLLECTION = gql`
  mutation registerContainerCollection($input: NormalizeContainerCollectionInput!) {
    normalizeContainerCollection(input: $input)
  }
`;

export default REGISTER_CONTAINER_COLLECTION;
