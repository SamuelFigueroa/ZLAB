import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProgressIndicator from '../ProgressIndicator';

import GET_CONTAINER_HINTS from '../../graphql/containers/getContainerHints';

import { Query } from 'react-apollo';

class GetContainerHints extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Query query={GET_CONTAINER_HINTS}>
        { ({ data, loading, error }) => {
          if (loading) return <ProgressIndicator />;
          if (error) return error;

          const { containerHints } = data;
          return this.props.children(containerHints);
        }}
      </Query>
    );
  }
}

GetContainerHints.propTypes = {
  children: PropTypes.func.isRequired,
};

export default GetContainerHints;
