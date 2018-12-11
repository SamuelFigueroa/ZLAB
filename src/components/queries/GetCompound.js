import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProgressIndicator from '../ProgressIndicator';

import GET_COMPOUND from '../../graphql/compounds/getCompound';

import { Query } from 'react-apollo';

class GetCompound extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { id } = this.props;
    return(
      <Query query={GET_COMPOUND} variables={{ id }}>
        { ({ data, loading, error }) => {
          if (loading) return <ProgressIndicator />;
          if (error) return `Error!: ${error}`;

          const { compound } = data;
          return this.props.children(compound);
        }}
      </Query>
    );
  }
}

GetCompound.propTypes = {
  children: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired
};

export default GetCompound;
