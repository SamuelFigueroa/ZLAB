import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProgressIndicator from '../ProgressIndicator';

import GET_REAGENT_HINTS from '../../graphql/reagents/getReagentHints';

import { Query } from 'react-apollo';

class GetReagentHints extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Query query={GET_REAGENT_HINTS}>
        { ({ data, loading, error }) => {
          if (loading) return <ProgressIndicator />;
          if (error) return error;

          const { reagentHints } = data;
          return this.props.children(reagentHints);
        }}
      </Query>
    );
  }
}

GetReagentHints.propTypes = {
  children: PropTypes.func.isRequired,
};

export default GetReagentHints;
