import gql from 'graphql-tag';

const QUICK_PRINT = gql`
  mutation quickPrint($input: QuickPrintInput!) {
    quickPrint(input: $input)
  }
`;

export default QUICK_PRINT;
