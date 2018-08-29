import React, { Component } from 'react';
import PropTypes from 'prop-types';
import jwt_decode from 'jwt-decode';

import SET_CURRENT_USER from '../../graphql/auth/setCurrentUser';

import { Mutation } from 'react-apollo';

class SetCurrentUser extends Component {
  constructor(props) {
    super(props);
    this.state={
      payload: localStorage.jwtToken ? jwt_decode(localStorage.jwtToken) : {}
    };
    this.setCurrentUser = React.createRef();
  }

  componentDidMount() {
    if (Object.keys(this.state.payload).length !== 0) {
      // Check for expired token
      const currentTime = Date.now() / 1000;
      if (this.state.payload.exp < currentTime) {
        // Logout user
        localStorage.removeItem('jwtToken');
        this.setCurrentUser.current.mutate({ variables: { payload: {} } });
        // Redirect to login
        window.location.href = '/login';
      }
      else {
        this.setCurrentUser.current.mutate({ variables: { payload: this.state.payload } });
      }
    }
  }

  componentWillUnmount() {
    this.setCurrentUser.current.mutate({ variables: { payload: {} } });
  }

  render() {

    return(
      <Mutation
        mutation={SET_CURRENT_USER}
        ref={this.setCurrentUser}
      >
        { () => this.props.children }
      </Mutation>
    );
  }
}

SetCurrentUser.propTypes = {
  children: PropTypes.node,
};

export default SetCurrentUser;
