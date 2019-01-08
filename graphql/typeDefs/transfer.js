import { gql } from 'apollo-server-express';

const Transfer = gql`

  type Transfer {
    source: ID
    destination: ID
    kind: String!
    amount: Float!
    amount_units: String!
    solvent: String!
    timestamp: String!
  }

  input TransferMassInput {
    source: String!
    destination: String!
    src_init_mg: Float
    src_fin_mg: Float
    dst_init_mg: Float
    dst_fin_mg: Float
  }

  input TransferVolumeInput {
    source: String!
    destination: String!
    volume: Float
    vol_units: String!
  }

  input DryInput {
    container: String!
  }

  input ResuspendInput {
    container: String!
    concentration: Float
    conc_units: String!
    solvent: String!
  }

  # Queries
  extend type Query {
    transfers(container: ID!): [Transfer]!
    transfer(id: ID!): Transfer!
  }

  # Mutations
  extend type Mutation {
    transferMass(input: TransferMassInput!) : Boolean
    transferVolume(input: TransferVolumeInput!) : Boolean
    dry(input: DryInput!) : Boolean
    resuspend(input: ResuspendInput!) : Boolean
  }
`;

export default () => [Transfer];
