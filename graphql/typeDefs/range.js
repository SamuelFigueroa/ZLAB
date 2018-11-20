import { gql } from 'apollo-server-express';

const Range = gql`

  input DateRange {
    min: String,
    max: String
  }

  input UnitRange {
    min: String,
    max: String
  }

  input NumberRange {
    min: Float
    max: Float
  }
`;

export default () => [Range];
