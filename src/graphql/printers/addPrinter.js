import gql from 'graphql-tag';

const ADD_PRINTER = gql`
  mutation addPrinter($input: AddPrinterInput!) {
    addPrinter(input: $input)
  }
`;

export default ADD_PRINTER;
