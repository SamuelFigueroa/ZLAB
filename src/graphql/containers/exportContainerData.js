import gql from 'graphql-tag';

const EXPORT_CONTAINER_DATA = gql`
    mutation exportContainerData($input: ExportContainerDataInput!) {
     exportContainerData(input: $input)
   }
`;

export default EXPORT_CONTAINER_DATA;
