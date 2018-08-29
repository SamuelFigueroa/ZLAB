import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import ADD_DOCUMENT from '../../graphql/documents/addDocument';
import VALIDATE_UPLOAD from '../../graphql/documents/validateUpload';


class AddDocument extends Component {
  constructor(props) {
    super(props);
    this.state={};
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
                mutation={ADD_DOCUMENT}
                awaitRefetchQueries={true}
              >
                { addDocument => {
                  const validateInput = input => validateUpload({ variables: { input }});
                  const callMutation = (input, refetchQueries) => addDocument(
                    { variables: { input },
                      refetchQueries: () => refetchQueries
                    });
                  return this.props.children(callMutation, validateInput, errors, clearErrors);
                }}
              </Mutation>
            )}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

AddDocument.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(AddDocument);
