import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProgressIndicator from '../ProgressIndicator';

import GET_COMPOUND_HINTS from '../../graphql/compounds/getCompoundHints';

import { Query } from 'react-apollo';

class GetCompoundHints extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Query query={GET_COMPOUND_HINTS}>
        { ({ data, loading, error }) => {
          if (loading) return <ProgressIndicator />;
          if (error) return error;

          const { compoundHints } = data;
          return this.props.children(compoundHints);
        }}
      </Query>
    );
  }
}

GetCompoundHints.propTypes = {
  children: PropTypes.func.isRequired,
};

export default GetCompoundHints;
