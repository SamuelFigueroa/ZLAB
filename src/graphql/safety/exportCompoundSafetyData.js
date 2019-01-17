import gql from 'graphql-tag';

const EXPORT_COMPOUND_SAFETY_DATA = gql`
    mutation exportCompoundSafetyData($input: ExportCompoundSafetyDataInput!) {
     exportCompoundSafetyData(input: $input)
   }
`;

export default EXPORT_COMPOUND_SAFETY_DATA;
