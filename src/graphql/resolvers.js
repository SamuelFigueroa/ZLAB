import gql from 'graphql-tag';

const defaultPaginationOptions = {
  __typename: 'PaginationOptions',
  page: 0,
  first: 25,
  last: null,
  after: null,
  before: null
};

const defaultSafetyFilter = {
  __typename: 'SafetyFilter',
  manufacturer: [],
  signalWord: [],
  pictograms: [],
  hClass: []
};

const defaultChemistryFilter = {
  __typename: 'ChemistryFilter',
  attributes: [],
  storage: [],
  registrationEventUser: [],
  registrationEventDate: ['',''],
  containerCategory: [],
  containerVendor: [],
  containerInstitution: [],
  containerResearcher: [],
  containerLocation: [],
  containerRegistrationEventUser: [],
  containerRegistrationEventDate: ['',''],
  containerMass: ['','mg','','mg'],
  containerVolume: ['','mL','','mL'],
  containerConcentration: ['','mM','','mM'],
  containerSolvent: [],
  containerState: [],
  containerOwner: [],
};

const defaultAssetFilter = {
  __typename: 'AssetFilter',
  category: [],
  location: [],
  brand: [],
  model: [],
  condition: [],
  shared: [],
  users: [],
  trainingRequired: [],
  registrationEventUser: [],
  registrationEventDate: ['',''],
  purchasingInfoSupplier: [],
  purchasingInfoPrice: ['',''],
  purchasingInfoDate: ['',''],
  purchasingInfoWarrantyExp: ['',''],
  grantFundingAgency: [],
  grantNumber: [],
  grantProjectName: [],
  maintenanceLogService: [],
  maintenanceLogAgent: [],
  maintenanceLogDate: ['',''],
  maintenanceLogScheduled: ['',''],

  purchaseLogPrice: ['',''],
  purchaseLogSupplier: [],
  purchaseLogDate: ['',''],
  purchaseLogReceived: ['',''],
};

const clientResolvers = {
  Query: {

    chemistryQueryVariables: (_, args, { cache }) => {
      const { id } = args;
      const fragment = gql`
        fragment chemistryQueryVariables on ChemistryQueryVariables {
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
        }`;
      const variables = cache.readFragment({ fragment, id: `ChemistryQueryVariables:${id}` });
      if (variables === null) {
        return ({
          __typename: 'ChemistryQueryVariables',
          id,
          filter: defaultChemistryFilter,
          search: null,
          search2: '',
          searchCategories: [],
          substructurePattern: '',
          substructureRemoveHs: true,
          filterOn: false,
          cached: false,
          resultsCount: 0,
          pagination: defaultPaginationOptions
        });
      }

      return variables;
    },
    assetQueryVariables: (_, args, { cache }) => {
      const { id } = args;
      const fragment = gql`
        fragment assetQueryVariables on AssetQueryVariables {
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
          pagination {
            page
            first
            last
            before
            after
          }
        }`;
      const variables = cache.readFragment({ fragment, id: `AssetQueryVariables:${id}` });
      if (variables === null) {
        return ({
          __typename: 'AssetQueryVariables',
          id,
          filter: defaultAssetFilter,
          search: null,
          search2: '',
          searchCategories: [],
          filterOn: false,
          cached: false,
          resultsCount: 0,
          pagination: defaultPaginationOptions
        });
      }

      return variables;
    },
    safetyQueryVariables: (_, args, { cache }) => {
      const { id } = args;
      const fragment = gql`
        fragment safetyQueryVariables on SafetyQueryVariables {
          id
          filter {
            manufacturer
            signalWord
            pictograms
            hClass
          }
          search
          search2
          searchCategories
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
        }`;
      const variables = cache.readFragment({ fragment, id: `SafetyQueryVariables:${id}` });
      if (variables === null) {
        return ({
          __typename: 'SafetyQueryVariables',
          id,
          filter: defaultSafetyFilter,
          search: null,
          search2: '',
          searchCategories: [],
          filterOn: false,
          cached: false,
          resultsCount: 0,
          pagination: defaultPaginationOptions
        });
      }

      return variables;
    }
  },
  Mutation: {
    setCurrentUser: (_, args, { cache }) => {
      const { payload } = args;
      const query = gql`
        {
            auth @client {
              user {
                exp
                iat
                login
                name
                email
                admin
              }
              isAuthenticated
          }
        }`;
      const { auth } = cache.readQuery({ query });
      if (Object.keys(payload).length === 0) {
        Object.assign(auth.user,
          {
            exp: null,
            iat: null,
            login: null,
            name: null,
            email: null,
            admin: false
          });
      } else {
        Object.assign(auth.user, payload);
      }
      Object.assign(auth, { isAuthenticated: (Object.keys(payload).length !== 0) });
      const data = { auth };
      cache.writeQuery({ query, data });
      return null;
    },
    setErrors: (_, args, { cache }) => {
      const { errors } = args;
      const query = gql`
        {
            errors @client {
              key
              message
          }
        }`;
      cache.writeQuery({ query, data: { errors }});
      return null;
    },
    addQueryVariables: (_, args, { cache }) => {
      const { id, typename, searchCategories } = args.input;
      const fragment = gql`
        fragment ${typename}QueryId on ${typename} {
          id
          cached
        }`;
      const variables = cache.readFragment({ fragment, id: `${typename}:${id}` });

      if (variables.cached == false) {
        const data = {
          __typename: typename,
          id,
          searchCategories,
          cached: true
        };

        cache.writeData({ id: `${typename}:${id}`, data });
        return true;
      }
      return null;
    },
    updateChemistryQueryVariables: (_, args, { cache }) => {
      const { input } = args;
      const { id: queryId, ...variables } = input;
      const id = `ChemistryQueryVariables:${queryId}`;
      let data = variables;

      if(variables.search !== undefined) {
        data = {
          __typename: 'ChemistryQueryVariables',
          ...variables,
          filter: defaultChemistryFilter,
          filterOn: false,
          search2: '',
          substructurePattern: '',
          substructureRemoveHs: true,
          pagination: defaultPaginationOptions
        };
      }
      cache.writeData({ id, data });
      return null;
    },
    updateContainerNormalization: (_, args, { cache }) => {
      const { input } = args;

      const { id: fieldId, registerAs } = input;
      const id = `ContainerNormalization:${fieldId}`;
      let data = {
        registerAs
      };
      cache.writeData({ id, data });
      return null;
    },
    updateLocationNormalization: (_, args, { cache }) => {
      const { input } = args;

      const { id: fieldId, registerAs } = input;
      const id = `LocationNormalization:${fieldId}`;
      let data = {
        registerAs: registerAs === null ? null : ({
          __typename: 'StagedLocation',
          area: registerAs.area,
          sub_area: registerAs.sub_area
        })
      };
      cache.writeData({ id, data });
      return null;
    },
    updateUserNormalization: (_, args, { cache }) => {
      const { input } = args;

      const { id: fieldId, registerAs } = input;
      const id = `UserNormalization:${fieldId}`;
      let data = {
        registerAs
      };
      cache.writeData({ id, data });
      return null;
    },
    updateAssetQueryVariables: (_, args, { cache }) => {
      const { input } = args;
      const { id: queryId, ...variables } = input;
      const id = `AssetQueryVariables:${queryId}`;
      let data = variables;

      if(variables.search !== undefined) {
        data = {
          __typename: 'AssetQueryVariables',
          ...variables,
          filter: defaultAssetFilter,
          filterOn: false,
          search2: '',
          pagination: defaultPaginationOptions
        };
      }
      cache.writeData({ id, data });
      return null;
    },
    updateSafetyQueryVariables: (_, args, { cache }) => {
      const { input } = args;
      const { id: queryId, ...variables } = input;
      const id = `SafetyQueryVariables:${queryId}`;
      let data = variables;

      if(variables.search !== undefined) {
        data = {
          __typename: 'SafetyQueryVariables',
          ...variables,
          filter: defaultSafetyFilter,
          filterOn: false,
          search2: '',
          pagination: defaultPaginationOptions
        };
      }
      cache.writeData({ id, data });
      return null;
    }
  }
};

export default clientResolvers;
