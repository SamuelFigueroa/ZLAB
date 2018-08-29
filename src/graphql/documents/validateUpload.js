import gql from 'graphql-tag';

const VALIDATE_UPLOAD = gql`
  mutation validateUpload($input: UploadInput!) {
    validateUpload(input: $input)
  }
`;

export default VALIDATE_UPLOAD;
