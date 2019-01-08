import gql from 'graphql-tag';

const TRANSFER_VOLUME = gql`
  mutation transferVolume($input: TransferVolumeInput!) {
    transferVolume(input: $input)
  }
`;

export default TRANSFER_VOLUME;
