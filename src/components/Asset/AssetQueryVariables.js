import React, { Component } from 'react';
import PropTypes from 'prop-types';

import AddAssetQueryVariables from '../mutations/AddAssetQueryVariables';
import UpdateAssetQueryVariables from '../mutations/UpdateAssetQueryVariables';
import GetAssetQueryVariables from '../queries/GetAssetQueryVariables';

class AssetQueryVariables extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { id } = this.props;
    return(
      <GetAssetQueryVariables id={id}>
        { getQueryVariables => (
          <UpdateAssetQueryVariables id={id}>
            { updateQueryVariables => (
              <AddAssetQueryVariables id={id}>
                { (addQueryVariables, initialized) =>
                  this.props.children(getQueryVariables, addQueryVariables, updateQueryVariables, initialized)
                }
              </AddAssetQueryVariables>
            )}
          </UpdateAssetQueryVariables>
        )}
      </GetAssetQueryVariables>
    );
  }
}

AssetQueryVariables.propTypes = {
  children: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired
};

export default AssetQueryVariables;
