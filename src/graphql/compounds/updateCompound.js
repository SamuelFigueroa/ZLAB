import gql from 'graphql-tag';

const UPDATE_COMPOUND = gql`
  mutation updateCompound($input: UpdateCompoundInput!) {
    updateCompound(input: $input)
  }
`;

export default UPDATE_COMPOUND;
