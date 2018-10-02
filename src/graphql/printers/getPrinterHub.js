import gql from 'graphql-tag';

const GET_PRINTER_HUB = gql`
     query getPrinterHub($address: String!) {
      printerHub(address: $address) {
        name
        user
      }
    }
`;



export default GET_PRINTER_HUB;
