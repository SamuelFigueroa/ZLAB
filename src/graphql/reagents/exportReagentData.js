import gql from 'graphql-tag';

const EXPORT_REAGENT_DATA = gql`
    mutation exportReagentData($input: ExportReagentDataInput!) {
     exportReagentData(input: $input)
   }
`;

export default EXPORT_REAGENT_DATA;
