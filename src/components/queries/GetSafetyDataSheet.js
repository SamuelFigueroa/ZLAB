import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProgressIndicator from '../ProgressIndicator';

import GET_SAFETY_DATA_SHEET from '../../graphql/safety/getSafetyDataSheet';

import { Query } from 'react-apollo';

class GetSafetyDataSheet extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { id } = this.props;
    return(
      <Query query={GET_SAFETY_DATA_SHEET} variables={{ id }}>
        { ({ data, loading, error }) => {
          if (loading) return <ProgressIndicator />;
          if (error) return `Error!: ${error}`;

          const { safetyDataSheet } = data;
          return this.props.children(safetyDataSheet);
        }}
      </Query>
    );
  }
}

GetSafetyDataSheet.propTypes = {
  children: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired
};

export default GetSafetyDataSheet;
