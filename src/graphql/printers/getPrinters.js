import gql from 'graphql-tag';

const GET_PRINTERS = gql`
  query getPrinters {
    printers {
      name
    }
  }
`;



export default GET_PRINTERS;
