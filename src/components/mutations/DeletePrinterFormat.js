import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import DELETE_PRINTER_FORMAT from '../../graphql/printers/deletePrinterFormat';
import GET_PRINTER_FORMATS from '../../graphql/printers/getPrinterFormats';

class DeletePrinterFormat extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError) => (
          <Mutation
            mutation={DELETE_PRINTER_FORMAT}
            awaitRefetchQueries={true}
            onError={ errorObj => handleError(errorObj) }
          >
            { deletePrinterFormat => {
              const callMutation = ids => deletePrinterFormat({
                variables: { ids },
                refetchQueries: () => [ { query: GET_PRINTER_FORMATS, variables: { withFields: false } } ]
              });
              return this.props.children(callMutation);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

DeletePrinterFormat.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(DeletePrinterFormat);
