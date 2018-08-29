import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { Mutation } from 'react-apollo';

import SET_CURRENT_USER from '../../graphql/auth/setCurrentUser';

class LogoutUser extends Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return (
      <Mutation
        mutation={SET_CURRENT_USER}
        awaitRefetchQueries={true}>
        { (setCurrentUser) => {
          const logoutUser = async () => {
            localStorage.removeItem('jwtToken');
            await setCurrentUser({ variables: { payload: {} }});
            return this.props.history.push('/login');
          };
          return this.props.children(logoutUser);
        }}
      </Mutation>
    );
  }
}

LogoutUser.propTypes = {
  children: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
};

export default withRouter(LogoutUser);
