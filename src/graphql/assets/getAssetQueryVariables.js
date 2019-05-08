import gql from 'graphql-tag';

const GET_ASSET_QUERY_VARS = gql`
  query getAssetQueryVariables($id: String!) {
    assetQueryVariables(id: $id) @client(always:true) {
      id
      filter {
        category
        location
        brand
        model
        condition
        shared
        users
        trainingRequired
        registrationEventUser
        registrationEventDate
        purchasingInfoSupplier
        purchasingInfoPrice
        purchasingInfoDate
        purchasingInfoWarrantyExp
        grantFundingAgency
        grantNumber
        grantProjectName
        maintenanceLogService
        maintenanceLogAgent
        maintenanceLogDate
        maintenanceLogScheduled

        purchaseLogPrice
        purchaseLogSupplier
        purchaseLogDate
        purchaseLogReceived
      }
      search
      search2
      searchCategories
      filterOn
      cached
      resultsCount
    }
  }
`;

export default GET_ASSET_QUERY_VARS;
