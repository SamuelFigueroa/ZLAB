import React, { Component } from 'react';
import PropTypes from 'prop-types';

import GET_PRINTERS from '../../graphql/printers/getPrinters';

import { Query } from 'react-apollo';

class GetPrinters extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Query query={GET_PRINTERS}>
        { ({ data, loading, error }) => {
          if (loading) return null;
          if (error) return `Error!: ${error}`;

          const { printers } = data;
          return this.props.children(printers);
        }}
      </Query>
    );
  }
}

GetPrinters.propTypes = {
  children: PropTypes.func.isRequired
};

export default GetPrinters;
