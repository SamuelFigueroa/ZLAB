import gql from 'graphql-tag';

const ADD_LOCATION = gql`
  mutation addLocation($input: AddLocationInput!) {
    addLocation(input: $input)
  }
`;

export default ADD_LOCATION;
