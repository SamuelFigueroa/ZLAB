import gql from 'graphql-tag';

const UPDATE_PRINTER_FORMAT = gql`
  mutation updatePrinterFormat($input: UpdatePrinterFormatInput!) {
    updatePrinterFormat(input: $input)
  }
`;

export default UPDATE_PRINTER_FORMAT;
