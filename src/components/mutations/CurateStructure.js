import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import CURATE_STRUCTURE from '../../graphql/compounds/curateStructure';

class CurateStructure extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Mutation
            mutation={CURATE_STRUCTURE}
            onCompleted={ () => this.props.history.push('/chemistry/all#containers') }
            onError={ errorObj => handleError(errorObj) }
          >
            { curateStructure => {
              const callMutation = input => curateStructure({
                variables: { input },
              });
              return this.props.children(callMutation, errors, clearErrors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

CurateStructure.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired,
};

export default withRouter(CurateStructure);
