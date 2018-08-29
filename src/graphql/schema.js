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

  type Mutation {
    setCurrentUser(payload: Payload!) : Boolean
    setErrors(errors: [ErrorInput]!) : Boolean
  }

  type Query {
    auth: Auth!
    getCurrentUser : UserPayload
    errors: [Error]!
  }
`;

export default typeDefs;
