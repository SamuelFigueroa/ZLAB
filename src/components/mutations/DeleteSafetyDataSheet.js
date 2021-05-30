import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import DELETE_SAFETY_DATA_SHEET from '../../graphql/safety/deleteSafetyDataSheet';
// import GET_SAFETY_DATA_SHEETS from '../../graphql/safety/getSafetyDataSheets';

class DeleteSafetyDataSheet extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { handleError => (
          <Mutation
            mutation={DELETE_SAFETY_DATA_SHEET}
            awaitRefetchQueries={true}
            onCompleted={ () => this.props.history.push('/safety/sds/all') }
            onError={ errorObj => handleError(errorObj) }
          >
            { deleteSafetyDataSheet => {
              const callMutation = id => deleteSafetyDataSheet({
                variables: { id },
                // refetchQueries: () => [ { query: GET_SAFETY_DATA_SHEETS, variables: { first: 25 } } ]
              });
              return this.props.children(callMutation);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

DeleteSafetyDataSheet.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(DeleteSafetyDataSheet);
