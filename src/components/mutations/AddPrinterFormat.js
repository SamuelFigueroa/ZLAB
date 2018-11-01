import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import ADD_PRINTER_FORMAT from '../../graphql/printers/addPrinterFormat';
import GET_PRINTER_FORMATS from '../../graphql/printers/getPrinterFormats';

class AddPrinterFormat extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={ADD_PRINTER_FORMAT}
            awaitRefetchQueries={true}
            onCompleted={ () => this.props.history.goBack() }
            onError={ errorObj => handleError(errorObj) }
          >
            { addPrinterFormat => {
              const callMutation = (input) => addPrinterFormat({ variables: { input },
                refetchQueries: () => [
                  { query: GET_PRINTER_FORMATS, variables: { withFields: false } },
                  { query: GET_PRINTER_FORMATS, variables: { withFields: true } }
                ]
              });
              return this.props.children(callMutation, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

AddPrinterFormat.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(AddPrinterFormat);
