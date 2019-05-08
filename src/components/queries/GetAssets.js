import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProgressIndicator from '../ProgressIndicator';
import GET_ASSETS from '../../graphql/assets/getAssets';

import { Query } from 'react-apollo';
import ErrorHandler from '../mutations/ErrorHandler';

class GetAssets extends Component {
  constructor(props) {
    super(props);
  }


  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Query
            query={GET_ASSETS}
            skip={true}
          >
            { ({ client }) => {
              const callQuery = async variables => {
                try {
                  const { data, loading, error } = await client.query({
                    query: GET_ASSETS,
                    variables,
                    fetchPolicy: 'network-only'
                  });
                  if (loading) return <ProgressIndicator />;
                  if (error) return `Error!: ${error}`;
                  const { assets } = data;
                  let formatted_assets = [];
                  for (const item of assets) {
                    if (item.category == 'Lab Equipment') {
                      let formatted_item = {
                        category: item.category,
                        results: item.results.map(equipment => ({...equipment,
                          location: (equipment.location.area.name == 'UNASSIGNED') ?
                            'UNASSIGNED' : `${equipment.location.area.name} / ${equipment.location.sub_area.name}` }))
                      };
                      formatted_assets.push(formatted_item);
                    } else {
                      formatted_assets.push(item);
                    }
                  }
                  return formatted_assets;
                } catch(errorObj) {
                  await handleError(errorObj);
                }
              };
              return this.props.children(callQuery, errors, clearErrors);
            }}
          </Query>
        )}
      </ErrorHandler>
    );
  }
}

GetAssets.propTypes = {
  children: PropTypes.func.isRequired,
};

export default GetAssets;
