import gql from 'graphql-tag';

const GET_LOCATIONS = gql`
     {
      locations {
        id
        area {
          name
          sub_areas {
            id
            name
          }
        }
      }
    }
`;



export default GET_LOCATIONS;
