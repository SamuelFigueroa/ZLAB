import gql from 'graphql-tag';

const GET_PRINTER = gql`
  query getPrinter($connection_name: String!) {
    printer(connection_name: $connection_name) {
      id
      name
      connection_name
      queue
      jobs {
        id
        name
        data
        time_added
        status
      }
    }
  }
`;



export default GET_PRINTER;
