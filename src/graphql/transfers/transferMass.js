import gql from 'graphql-tag';

const TRANSFER_MASS = gql`
  mutation transferMass($input: TransferMassInput!) {
    transferMass(input: $input)
  }
`;

export default TRANSFER_MASS;
