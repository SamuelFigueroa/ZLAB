import React, { Component } from 'react';
import PropTypes from 'prop-types';

import GET_USERS from '../../graphql/users/getUsers';

import { Query } from 'react-apollo';

class GetUsers extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Query query={GET_USERS}>
        { ({ data, loading, error }) => {
          if (loading) return null;
          if (error) return `Error!: ${error}`;

          const { users } = data;
          return this.props.children(users);
        }}
      </Query>
    );
  }
}

GetUsers.propTypes = {
  children: PropTypes.func.isRequired
};

export default GetUsers;
