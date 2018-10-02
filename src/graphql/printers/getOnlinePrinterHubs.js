import gql from 'graphql-tag';

const GET_ONLINE_PRINTER_HUBS = gql`
     query getOnlinePrinterHubs {
      onlinePrinterHubs {
        id
        name
        address
      }
    }
`;



export default GET_ONLINE_PRINTER_HUBS;
