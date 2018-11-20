import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProgressIndicator from '../ProgressIndicator';

import GET_REAGENT from '../../graphql/reagents/getReagent';

import { Query } from 'react-apollo';

class GetReagent extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { id } = this.props;
    return(
      <Query query={GET_REAGENT} variables={{ id }}>
        { ({ data, loading, error }) => {
          if (loading) return <ProgressIndicator />;
          if (error) return `Error!: ${error}`;

          const { reagent } = data;
          return this.props.children(reagent);
        }}
      </Query>
    );
  }
}

GetReagent.propTypes = {
  children: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired
};

export default GetReagent;
