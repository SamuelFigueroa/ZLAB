import gql from 'graphql-tag';

const UPDATE_PRINTER = gql`
  mutation updatePrinter($input: UpdatePrinterInput!) {
    updatePrinter(input: $input)
  }
`;

export default UPDATE_PRINTER;
