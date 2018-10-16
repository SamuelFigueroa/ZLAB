import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LinearProgress from '@material-ui/core/LinearProgress';

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
              const callQuery = async input => {
                try {
                  const { data, loading, error } = await client.query({
                    query: GET_ASSETS,
                    variables: { input },
                    fetchPolicy: 'network-only'
                  });
                  if (loading) return <LinearProgress />;
                  if (error) return `Error!: ${error}`;
                  const { assets } = data;
                  let formatted_assets = assets;
                  if (input.category == 'Lab Equipment') {
                    formatted_assets = assets.map(asset => ({...asset,
                      location: (asset.location.area.name == 'UNASSIGNED') ?
                        'UNASSIGNED' : `${asset.location.area.name} / ${asset.location.sub_area.name}` }));
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
