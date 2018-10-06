import gql from 'graphql-tag';

const GET_EQUIPMENT_HINTS = gql`
  {
    equipmentHints {
      brand
      model
      purchasing_info {
       supplier
      }
      grant {
       funding_agency
       project_name
       grant_number
      }
    }
  }
`;

export default GET_EQUIPMENT_HINTS;
