import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LinearProgress from '@material-ui/core/LinearProgress';

import GET_LOCATIONS from '../../graphql/locations/getLocations';

import { Query } from 'react-apollo';

class GetLocations extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Query query={GET_LOCATIONS}>
        { ({ data, loading, error }) => {
          if (loading) return <LinearProgress />;
          if (error) return `Error!: ${error}`;

          const { locations } = data;
          return this.props.children(locations);
        }}
      </Query>
    );
  }
}

GetLocations.propTypes = {
  children: PropTypes.func.isRequired
};

export default GetLocations;
