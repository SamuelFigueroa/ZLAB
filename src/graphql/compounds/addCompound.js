import gql from 'graphql-tag';

const ADD_COMPOUND = gql`
  mutation addCompound($input: AddCompoundInput!) {
    addCompound(input: $input)
  }
`;

export default ADD_COMPOUND;
