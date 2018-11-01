import gql from 'graphql-tag';

const ADD_PRINTER_FORMAT = gql`
  mutation addPrinterFormat($input: AddPrinterFormatInput!) {
    addPrinterFormat(input: $input)
  }
`;

export default ADD_PRINTER_FORMAT;
