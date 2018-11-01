import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProgressIndicator from '../ProgressIndicator';

import GET_PRINTER from '../../graphql/printers/getPrinter';

import { Query } from 'react-apollo';

class GetPrinter extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Query query={GET_PRINTER} skip={true}>
        { ({ client }) => {
          const callQuery = async (connection_name) => {
            const { data, loading, error } = await client.query({
              query: GET_PRINTER,
              variables: { connection_name },
              fetchPolicy: 'network-only'
            });
            if (loading) return null;
            if (error) return `Error!: ${error}`;
            return data.printer;
          };
          return this.props.children(callQuery);
        }}
      </Query>
    );
  }
}

GetPrinter.propTypes = {
  children: PropTypes.func.isRequired,
};

export default GetPrinter;
