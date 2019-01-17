import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import ADD_SAFETY_DATA_SHEET from '../../graphql/safety/addSafetyDataSheet';
import VALIDATE_UPLOAD from '../../graphql/documents/validateUpload';
import GET_COMPOUNDS from '../../graphql/compounds/getCompounds';

class AddSafetyDataSheet extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={VALIDATE_UPLOAD}
            onError={ errorObj => handleError(errorObj)}
          >
            { validateUpload => (
              <Mutation
                mutation={ADD_SAFETY_DATA_SHEET}
                onError={ errorObj => handleError(errorObj)}
                awaitRefetchQueries={true}
              >
                { (addSafetyDataSheet, { loading }) => {
                  const validateInput = input => validateUpload({ variables: { input }});
                  const callMutation = input => addSafetyDataSheet(
                    { variables: { input },
                      refetchQueries:() => [
                        { query: GET_COMPOUNDS, variables: { filter: {}, search: null, withSDS: false } }
                      ]
                    });
                  return this.props.children(callMutation, validateInput, loading, errors, clearErrors);
                }}
              </Mutation>
            )}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

AddSafetyDataSheet.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(AddSafetyDataSheet);
