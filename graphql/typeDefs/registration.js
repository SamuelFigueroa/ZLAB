import { gql } from 'apollo-server-express';

const Registration = gql`

  type RegistrationEvent {
    user: String!
    date: String!
  }

  input RegistrationEventInput {
    user: String!
  }

  input RegistrationEventFilter {
    user: [String]
    date: DateRange
  }
  `;

export default () => [Registration];
