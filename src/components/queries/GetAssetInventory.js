import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProgressIndicator from '../ProgressIndicator';
import GET_ASSET_INVENTORY from '../../graphql/assets/getAssetInventory';

import { Query } from 'react-apollo';
import ErrorHandler from '../mutations/ErrorHandler';

class GetAssetInventory extends Component {
  constructor(props) {
    super(props);
  }


  render() {
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Query
            query={GET_ASSET_INVENTORY}
            skip={true}
          >
            { ({ client }) => {
              const callQuery = async variables => {
                try {
                  const { data, loading, error } = await client.query({
                    query: GET_ASSET_INVENTORY,
                    variables,
                    // fetchPolicy: 'network-only'
                  });
                  if (loading) return <ProgressIndicator />;
                  if (error) return `Error!: ${error}`;
                  const { edges, pageInfo, totalCount } = data.assetInventory.assetsConnection;
                  let formatted_assets = edges.map( ({ node: asset }) => {
                    if (asset.location !== undefined) {
                      return ({
                        ...asset,
                        location: (asset.location.area.name == 'UNASSIGNED') ?
                          'UNASSIGNED' : `${asset.location.area.name} / ${asset.location.sub_area.name}`
                      });
                    }
                    return asset;
                  });
                  return ({ data: formatted_assets, pageInfo, totalCount });
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

GetAssetInventory.propTypes = {
  children: PropTypes.func.isRequired,
};

export default GetAssetInventory;
