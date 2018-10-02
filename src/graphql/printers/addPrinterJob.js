import gql from 'graphql-tag';

const ADD_PRINTER_JOB = gql`
  mutation addPrinterJob($input: AddPrinterJobInput!) {
    addPrinterJob(input: $input)
  }
`;

export default ADD_PRINTER_JOB;
