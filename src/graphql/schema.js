const typeDefs = `
  type Auth {
    user: UserPayload!
    isAuthenticated: Boolean!
  }

  input Payload {
    exp: Int!
    iat: Int!
    login: String!
    name: String!
    email: String!
    admin: Boolean!
  }

  type UserPayload {
    exp: Int
    iat: Int
    login: String
    name: String
    email: String
    admin: Boolean
  }

  type Error {
    key: String,
    message: String
  }

  #input setErrorsInput {
  #  errors: [ErrorInput]!
  #}

  input ErrorInput {
    key: String,
    message: String
  }

  type ChemistryQueryVariables {
    id: String!
    filter: ChemistryFilter
    substructurePattern: String!
    substructureRemoveHs: Boolean!
    search: String
    search2: String!
    searchCategories: [String]!
    filterOn: Boolean!
    cached: Boolean!
    resultsCount: Int
  }

  type ChemistryFilter {
    attributes: [[String]]
    storage: [[String]]
    registrationEventUser: [String]
    registrationEventDate: [String]
    containerCategory: [[String]]
    containerVendor: [[String]]
    containerInstitution: [[String]]
    containerResearcher: [[String]]
    containerLocation: [[String]]
    containerRegistrationEventUser: [String]
    containerRegistrationEventDate: [String]
    containerMass: [String]
    containerVolume: [String]
    containerConcentration: [String]
    containerSolvent: [[String]]
    containerState: [[String]]
    containerOwner: [[String]]
  }

  input ChemistryFilterInput {
    attributes: [[String]]
    storage: [[String]]
    registrationEventUser: [String]
    registrationEventDate: [String]
    containerCategory: [[String]]
    containerVendor: [[String]]
    containerInstitution: [[String]]
    containerResearcher: [[String]]
    containerLocation: [[String]]
    containerRegistrationEventUser: [String]
    containerRegistrationEventDate: [String]
    containerMass: [String]
    containerVolume: [String]
    containerConcentration: [String]
    containerSolvent: [[String]]
    containerState: [[String]]
    containerOwner: [[String]]
  }

  input UpdateChemistryQueryVariablesInput {
    id: String!
    filter: ChemistryFilterInput
    substructurePattern: String
    substructureRemoveHs: Boolean
    search: String
    search2: String
    searchCategories: [String]
    filterOn: Boolean
    resultsCount: Int
  }

  input AddQueryVariablesInput {
    id: String!
    typename: String!
    searchCategories: [String]
  }

  type AssetQueryVariables {
    id: String!
    filter: AssetFilter
    search: String
    search2: String!
    searchCategories: [String]!
    filterOn: Boolean!
    cached: Boolean!
    resultsCount: Int
  }

  type AssetFilter {
    category: [[String]]
    location: [[String]]
    brand: [[String]]
    model: [[String]]
    condition: [[String]]
    shared: [[String]]
    users: [[String]]
    trainingRequired: [[String]]
    registrationEventUser: [String]
    registrationEventDate: [String]
    purchasingInfoSupplier: [[String]]
    purchasingInfoPrice: [String]
    purchasingInfoDate: [String]
    purchasingInfoWarrantyExp: [String]
    grantFundingAgency: [[String]]
    grantNumber: [[String]]
    grantProjectName: [[String]]
    maintenanceLogService: [[String]]
    maintenanceLogAgent: [[String]]
    maintenanceLogDate: [String]
    maintenanceLogScheduled: [String]

    purchaseLogPrice: [String]
    purchaseLogSupplier: [[String]]
    purchaseLogDate: [String]
    purchaseLogReceived: [String]
  }

  input AssetFilterInput {
    category: [[String]]
    location: [[String]]
    brand: [[String]]
    model: [[String]]
    condition: [[String]]
    shared: [[String]]
    users: [[String]]
    trainingRequired: [[String]]
    registrationEventUser: [String]
    registrationEventDate: [String]
    purchasingInfoSupplier: [[String]]
    purchasingInfoPrice: [String]
    purchasingInfoDate: [String]
    purchasingInfoWarrantyExp: [String]
    grantFundingAgency: [[String]]
    grantNumber: [[String]]
    grantProjectName: [[String]]
    maintenanceLogService: [[String]]
    maintenanceLogAgent: [[String]]
    maintenanceLogDate: [String]
    maintenanceLogScheduled: [String]

    purchaseLogPrice: [String]
    purchaseLogSupplier: [[String]]
    purchaseLogDate: [String]
    purchaseLogReceived: [String]
  }

  input UpdateAssetQueryVariablesInput {
    id: String!
    filter: AssetFilterInput
    search: String
    search2: String
    searchCategories: [String]
    filterOn: Boolean
    resultsCount: Int
  }

  type SafetyQueryVariables {
    id: String!
    filter: SafetyFilter
    search: String
    search2: String!
    searchCategories: [String]!
    filterOn: Boolean!
    cached: Boolean!
    resultsCount: Int
  }

  type SafetyFilter {
    manufacturer: [[String]]
    signalWord: [[String]]
    pictograms: [[String]]
    hClass: [[String]]
  }

  input SafetyFilterInput {
    manufacturer: [[String]]
    signalWord: [[String]]
    pictograms: [[String]]
    hClass: [[String]]
  }

  input UpdateSafetyQueryVariablesInput {
    id: String!
    filter: SafetyFilterInput
    search: String
    search2: String
    searchCategories: [String]
    filterOn: Boolean
    resultsCount: Int
  }

  input UpdateContainerNormalizationInput {
    id: String!
    registerAs: String
  }

  input UpdateUserNormalizationInput {
    id: String!
    registerAs: String
  }

  input RegisteredLocationInput {
    area: String!
    sub_area: String!
  }

  input UpdateLocationNormalizationInput {
    id: String!
    registerAs: RegisteredLocationInput
  }

  type Mutation {
    setCurrentUser(payload: Payload!) : Boolean
    setErrors(errors: [ErrorInput]!) : Boolean
    addQueryVariables(input: AddQueryVariablesInput!) : Boolean
    #Chemistry
    updateChemistryQueryVariables(input: UpdateChemistryQueryVariablesInput!) : Boolean
    #Assets
    updateAssetQueryVariables(input: UpdateAssetQueryVariablesInput!) : Boolean
    #Safety
    updateSafetyQueryVariables(input: UpdateSafetyQueryVariablesInput!) : Boolean
    #Container collections
    updateContainerNormalization(input: UpdateContainerNormalizationInput!) : Boolean
    updateLocationNormalization(input: UpdateLocationNormalizationInput!) : Boolean
    updateUserNormalization(input: UpdateUserNormalizationInput!) : Boolean
  }

  type Query {
    auth: Auth!
    getCurrentUser : UserPayload
    errors: [Error]!
    chemistryQueryVariables(id: String!) : ChemistryQueryVariables!
    assetQueryVariables(id: String!) : AssetQueryVariables!
    safetyQueryVariables(id: String!) : SafetyQueryVariables!
  }
`;

export default typeDefs;
