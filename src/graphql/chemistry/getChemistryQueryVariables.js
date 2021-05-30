import gql from 'graphql-tag';

const GET_CHEMISTRY_QUERY_VARS = gql`
  query getChemistryQueryVariables($id: String!) {
    chemistryQueryVariables(id: $id) @client(always:true) {
      id
      filter {
        attributes
        storage
        registrationEventUser
        registrationEventDate
        containerCategory
        containerVendor
        containerInstitution
        containerResearcher
        containerLocation
        containerRegistrationEventUser
        containerRegistrationEventDate
        containerMass
        containerVolume
        containerConcentration
        containerSolvent
        containerState
        containerOwner
      }
      search
      search2
      searchCategories
      substructurePattern
      substructureRemoveHs
      filterOn
      cached
      resultsCount
      pagination {
        page
        first
        last
        before
        after
      }
    }
  }
`;

export default GET_CHEMISTRY_QUERY_VARS;
