import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LinearProgress from '@material-ui/core/LinearProgress';


import GET_ASSETS from '../../graphql/assets/getAssets';

import { Query } from 'react-apollo';

class GetAssets extends Component {
  constructor(props) {
    super(props);
  }


  render() {
    return(
      <Query query={GET_ASSETS}>
        { ({ data, loading, error }) => {
          if (loading) return <LinearProgress />;
          if (error) return `Error!: ${error}`;

          const { assets } = data;
          const formatted_assets = assets.map(asset => ({...asset,
            location: (asset.location.area.name == 'UNASSIGNED') ?
              'UNASSIGNED' : `${asset.location.area.name} / ${asset.location.sub_area.name}` }));
          return this.props.children(formatted_assets);
        }}
      </Query>
    );
  }
}

GetAssets.propTypes = {
  children: PropTypes.func.isRequired
};

export default GetAssets;
