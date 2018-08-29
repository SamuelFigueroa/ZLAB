import gql from 'graphql-tag';

const SET_ERRORS = gql`
  mutation setErrors($errors: [ErrorInput]!) {
    setErrors(errors: $errors) @client
  }
`;

export default SET_ERRORS;
