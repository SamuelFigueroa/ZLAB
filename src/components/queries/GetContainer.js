import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProgressIndicator from '../ProgressIndicator';

import GET_CONTAINER from '../../graphql/containers/getContainer';

import { Query } from 'react-apollo';

class GetContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { id } = this.props;
    return(
      <Query query={GET_CONTAINER} variables={{ id }}>
        { ({ data, loading, error }) => {
          if (loading) return <ProgressIndicator />;
          if (error) return `Error!: ${error}`;

          const { container } = data;
          return this.props.children(container);
        }}
      </Query>
    );
  }
}

GetContainer.propTypes = {
  children: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired
};

export default GetContainer;
