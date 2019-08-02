import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router';
import { withRouter } from 'react-router-dom';

import { Mutation } from 'react-apollo';
import jwt_decode from 'jwt-decode';

import ErrorHandler from './ErrorHandler';
import GetCurrentUser from '../queries/GetCurrentUser';

import SET_CURRENT_USER from '../../graphql/auth/setCurrentUser';
import LOGIN_USER from '../../graphql/auth/loginUser';

class LoginUser extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return(
      <GetCurrentUser>
        { (user, isAuthenticated) => {
          if (isAuthenticated) return <Redirect to="/"/> ;

          return (
            <ErrorHandler>
              { (handleError, errors) => (
                <Mutation mutation={SET_CURRENT_USER}>
                  { setCurrentUser => (
                    <Mutation
                      mutation={LOGIN_USER}
                      onCompleted={
                        async data => {
                          const { token } = data.login;
                          //Set token to local localStorage
                          localStorage.setItem('jwtToken', token);
                          // Decode token to get user data
                          await setCurrentUser({ variables: { payload: jwt_decode(token) } });
                          return this.props.history.push('/');
                        }
                      }
                      onError={ errorObj => handleError(errorObj) }
                    >
                      { loginUser => {
                        const callMutation = (input) => loginUser({ variables: { input } });
                        return this.props.children(callMutation, errors);
                      }}
                    </Mutation>
                  )}
                </Mutation>
              )}
            </ErrorHandler>
          );
        }}
      </GetCurrentUser>
    );
  }
}

LoginUser.propTypes = {
  children: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
};

export default withRouter(LoginUser);
