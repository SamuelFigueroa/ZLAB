import gql from 'graphql-tag';

const PREVIEW_SAFETY_DATA_SHEET = gql`
    mutation previewSafetyDataSheet($sds_id: String!) {
     previewSafetyDataSheet(sds_id: $sds_id)
   }
`;

export default PREVIEW_SAFETY_DATA_SHEET;
