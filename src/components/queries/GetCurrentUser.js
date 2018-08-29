import React, { Component } from 'react';
import PropTypes from 'prop-types';


import GET_CURRENT_USER from '../../graphql/auth/getCurrentUser';

import { Query } from 'react-apollo';

class GetCurrentUser extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Query query={GET_CURRENT_USER}>
        { ({ data, loading, error }) => {
          if (loading) return null;
          if (error) return `Error!: ${error}`;

          const { auth } = data;
          return this.props.children(auth.user, auth.isAuthenticated);
        }}
      </Query>
    );
  }
}

GetCurrentUser.propTypes = {
  children: PropTypes.func.isRequired
};

export default GetCurrentUser;
