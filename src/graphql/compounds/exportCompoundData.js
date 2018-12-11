import gql from 'graphql-tag';

const EXPORT_COMPOUND_DATA = gql`
    mutation exportCompoundData($input: ExportCompoundDataInput!) {
     exportCompoundData(input: $input)
   }
`;

export default EXPORT_COMPOUND_DATA;
