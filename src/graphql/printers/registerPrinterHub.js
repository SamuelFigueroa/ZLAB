import gql from 'graphql-tag';

const REGISTER_PRINTER_HUB = gql`
  mutation registerPrinterHub($input: PrinterHubInput!) {
    registerPrinterHub(input: $input) {
      response
    }
  }
`;

export default REGISTER_PRINTER_HUB;
