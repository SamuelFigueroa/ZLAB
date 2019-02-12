import gql from 'graphql-tag';

const DELETE_LOCATION = gql`
  mutation deleteLocation($input: [DeleteLocationInput!]!) {
    deleteLocation(input: $input)
  }
`;

export default DELETE_LOCATION;
