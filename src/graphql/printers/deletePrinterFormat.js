import gql from 'graphql-tag';

const DELETE_PRINTER_FORMAT = gql`
  mutation deletePrinterFormat($ids: [ID!]!) {
    deletePrinterFormat(ids: $ids)
  }
`;

export default DELETE_PRINTER_FORMAT;
