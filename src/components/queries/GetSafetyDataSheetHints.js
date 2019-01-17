import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProgressIndicator from '../ProgressIndicator';

import GET_SAFETY_DATA_SHEET_HINTS from '../../graphql/safety/getSafetyDataSheetHints';

import { Query } from 'react-apollo';

class GetSafetyDataSheetHints extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Query query={GET_SAFETY_DATA_SHEET_HINTS}>
        { ({ data, loading, error }) => {
          if (loading) return <ProgressIndicator />;
          if (error) return error;

          const { safetyDataSheetHints } = data;
          return this.props.children(safetyDataSheetHints);
        }}
      </Query>
    );
  }
}

GetSafetyDataSheetHints.propTypes = {
  children: PropTypes.func.isRequired,
};

export default GetSafetyDataSheetHints;
