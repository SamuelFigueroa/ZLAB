import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';
import ErrorHandler from './ErrorHandler';

import REGISTER_USER from '../../graphql/auth/registerUser';

class RegisterUser extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <ErrorHandler>
        { (handleError, errors) => (
          <Mutation
            mutation={REGISTER_USER}
            onCompleted={ () => this.props.history.push('/login') }
            onError={ errorObj => handleError(errorObj) }
          >
            { registerUser => {
              const callMutation = (input) => registerUser({ variables: { input } });
              return this.props.children(callMutation, errors);
            }}
          </Mutation>
        )}
      </ErrorHandler>
    );
  }
}

RegisterUser.propTypes = {
  history: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired
};

export default withRouter(RegisterUser);
