import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import StructureImage from '../Chemistry/StructureImage';

const styles = theme => ({
  image: {
    width: theme.spacing.unit * 6,
    height: theme.spacing.unit * 6,
    margin:'auto'
  }
});
import GET_STAGED_CONTAINERS from '../../graphql/containerCollections/getStagedContainers';

import { Query } from 'react-apollo';

class GetStagedContainers extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes, collectionID } = this.props;
    return(
      <Query query={GET_STAGED_CONTAINERS}
        fetchPolicy="cache-and-network"
        notifyOnNetworkStatusChange={true}
        variables={{ collectionID, offset: 0, limit: 100 }}>
        { ({ data, fetchMore, loading, error }) => {

          if (loading) return null;
          if (error) return `Error!: ${error}`;
          const onLoadMore = limit =>
            fetchMore({
              variables: {
                collectionID,
                offset: stagedContainers.length,
                limit
              },
              updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult) return prev;
                return Object.assign({}, prev, {
                  stagedContainers: [...prev.stagedContainers, ...fetchMoreResult.stagedContainers]
                });
              }
            });

          const { stagedContainers: containers } = data;
          const stagedContainers = containers.map(container => ({
            ...container,
            cas: container.content.cas,
            molblock: <StructureImage className={classes.image} molblock={container.content.molblock} />
          }));

          return this.props.children(stagedContainers, onLoadMore, loading);
        }}
      </Query>
    );
  }
}

GetStagedContainers.propTypes = {
  children: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  collectionID: PropTypes.string.isRequired,
};

export default withStyles(styles)(GetStagedContainers);
