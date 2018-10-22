import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProgressIndicator from '../ProgressIndicator';
import SEARCH_ASSETS from '../../graphql/assets/searchAssets';

import { Query } from 'react-apollo';

class SearchAssets extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Query
        query={SEARCH_ASSETS}
        skip={true}
      >
        { ({ client }) => {
          const callQuery = async search => {
            const { data, loading, error } = await client.query({
              query: SEARCH_ASSETS,
              variables: { search },
              fetchPolicy: 'network-only'
            });
            if (loading) return <ProgressIndicator />;
            if (error) return `Error!: ${error}`;
            const { searchAssets } = data;
            let formatted_assets = searchAssets.map(search => {
              if (search.category == 'Lab Equipment') {
                search.results = search.results.map(equipment => ({...equipment,
                  location: (equipment.location.area.name == 'UNASSIGNED') ?
                    'UNASSIGNED' : `${equipment.location.area.name} / ${equipment.location.sub_area.name}` }));
              }
            });
            return formatted_assets;
          };
          return this.props.children(callQuery);
        }}
      </Query>
    );
  }
}

SearchAssets.propTypes = {
  children: PropTypes.func.isRequired,
};

export default SearchAssets;
