import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProgressIndicator from '../ProgressIndicator';

import GET_PRINTER_FORMATS from '../../graphql/printers/getPrinterFormats';

import { Query } from 'react-apollo';

class GetPrinterFormats extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { withFields } = this.props;
    return(
      <Query query={GET_PRINTER_FORMATS} variables={{ withFields }}>
        { ({ data, loading, error }) => {
          if (loading) return <ProgressIndicator />;
          if (error) return `Error!: ${error}`;

          const { printerFormats } = data;
          return this.props.children(printerFormats);
        }}
      </Query>
    );
  }
}

GetPrinterFormats.propTypes = {
  children: PropTypes.func.isRequired,
  withFields: PropTypes.bool.isRequired
};

export default GetPrinterFormats;
