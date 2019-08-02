import gql from 'graphql-tag';

const EXPORT_CONTAINER_COLLECTION = gql`
    mutation exportContainerCollection($id: ID!) {
     exportContainerCollection(id: $id)
   }
`;

export default EXPORT_CONTAINER_COLLECTION;
