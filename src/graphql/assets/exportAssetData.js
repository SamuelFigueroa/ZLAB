import gql from 'graphql-tag';

const EXPORT_ASSET_DATA = gql`
    mutation exportAssetData($input: ExportAssetDataInput!) {
     exportAssetData(input: $input)
   }
`;

export default EXPORT_ASSET_DATA;
