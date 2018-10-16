import gql from 'graphql-tag';

const GET_ASSET_HINTS = gql`
  query getAssetHints($category: String!) {
    assetHints(category: $category) {
      brand
      model
      purchasing_info {
       supplier
      }
      grant {
       funding_agency
       project_name
       grant_number
      }
      maintenance_log {
        agent
      }
      purchase_log {
        supplier
      }
    }
  }
`;

export default GET_ASSET_HINTS;
