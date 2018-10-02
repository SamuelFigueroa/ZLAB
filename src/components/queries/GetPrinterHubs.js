import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LinearProgress from '@material-ui/core/LinearProgress';

import GET_ONLINE_PRINTER_HUBS from '../../graphql/printers/getOnlinePrinterHubs';

import { Query } from 'react-apollo';

class GetPrinterHubs extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Query query={GET_ONLINE_PRINTER_HUBS}>
        { ({ data, loading, error }) => {
          if (loading) return <LinearProgress />;
          if (error) return `Error!: ${error}`;

          const { onlinePrinterHubs } = data;
          return this.props.children(onlinePrinterHubs);
        }}
      </Query>
    );
  }
}

GetPrinterHubs.propTypes = {
  children: PropTypes.func.isRequired
};

export default GetPrinterHubs;
