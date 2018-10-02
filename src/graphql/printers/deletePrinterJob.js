import gql from 'graphql-tag';

const DELETE_PRINTER_JOB = gql`
  mutation deletePrinterJob($input: DeletePrinterJobInput!) {
    deletePrinterJob(input: $input)
  }
`;

export default DELETE_PRINTER_JOB;
