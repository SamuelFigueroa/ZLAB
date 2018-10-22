import { gql } from 'apollo-server-express';

const User = gql`

  # Server-side types
  type User {
    id: ID!
    email: String!
    login: String!
    name: String!
    admin: Boolean!
  }

  input AddUserInput {
    email: String!
    login: String!
    name: String!
    password: String!
    password2: String!
    admin: Boolean!
  }

  input loginInput {
    login: String!
    password: String!
  }

  type loginOutput {
    success: Boolean
    token: String
  }

  #Client-side types

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

  # Queries
  extend type Query {
    auth: Auth!
    getCurrentUser : UserPayload
    users: [User]!
  }

  # Mutations
  extend type Mutation {
    login(input: loginInput!) : loginOutput!
    setCurrentUser(payload: Payload!) : Boolean

    #Create Mutations
    addUser(input: AddUserInput!) : Boolean
  }
`;

export default () => [User];
