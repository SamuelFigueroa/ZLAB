import gql from 'graphql-tag';

const UPDATE_LOCATION = gql`
  mutation updateLocation($input: UpdateLocationInput!) {
    updateLocation(input: $input)
  }
`;

export default UPDATE_LOCATION;
