import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import UPDATE_PRINTER_FORMAT from '../../graphql/printers/updatePrinterFormat';
import GET_PRINTER_FORMAT from '../../graphql/printers/getPrinterFormat';

class UpdatePrinterFormat extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={UPDATE_PRINTER_FORMAT}
            awaitRefetchQueries={true}
            onCompleted={ () => this.props.history.goBack() }
            onError={ errorObj => handleError(errorObj) }
          >
            { updatePrinterFormat => {
              const callMutation = (input) => updatePrinterFormat({ variables: { input },
                refetchQueries:() => [
                  { query: GET_PRINTER_FORMAT, variables: { id: input.id } },
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

UpdatePrinterFormat.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(UpdatePrinterFormat);
