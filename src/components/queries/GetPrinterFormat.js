import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProgressIndicator from '../ProgressIndicator';

import GET_PRINTER_FORMAT from '../../graphql/printers/getPrinterFormat';

import { Query } from 'react-apollo';

class GetPrinterFormat extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { id } = this.props;
    return(
      <Query query={GET_PRINTER_FORMAT} variables={{ id }}>
        { ({ data, loading, error }) => {
          if (loading) return <ProgressIndicator />;
          if (error) return `Error!: ${error}`;

          const { printerFormat } = data;
          return this.props.children(printerFormat);
        }}
      </Query>
    );
  }
}

GetPrinterFormat.propTypes = {
  children: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired
};

export default GetPrinterFormat;
