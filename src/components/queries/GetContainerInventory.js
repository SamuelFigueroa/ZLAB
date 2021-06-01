import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProgressIndicator from '../ProgressIndicator';
import { withStyles } from '@material-ui/core/styles';

import GET_CONTAINER_INVENTORY from '../../graphql/containers/getContainerInventory';

import { Query } from 'react-apollo';
import ErrorHandler from '../mutations/ErrorHandler';
import StructureImage from '../Chemistry/StructureImage';

const styles = theme => ({
  image: {
    width: theme.spacing.unit * 6,
    height: theme.spacing.unit * 6,
    margin:'auto'
  }
});

class GetContainerInventory extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Query
            query={GET_CONTAINER_INVENTORY}
            skip={true}
          >
            { ({ client }) => {
              const callQuery = async (variables, fetchPolicy) => {
                try {
                  const { data, loading, error } = await client.query({
                    query: GET_CONTAINER_INVENTORY,
                    variables,
                    fetchPolicy
                  });
                  if (loading) return <ProgressIndicator />;
                  if (error) return `Error!: ${error}`;
                  const { edges, pageInfo, totalCount } = data.containerInventory.containersConnection;
                  let formatted_containers = edges.map( ({ node: container }) => ({
                    ...container,
                    mass: container.mass !== null ? Math.round(container.mass * 1000)/1000 : null,
                    volume: container.volume !== null ? Math.round(container.volume * 1000)/1000 : null,
                    concentration: container.concentration !== null ? Math.round(container.concentration * 1000)/1000 : null,
                    molblock: <StructureImage className={classes.image} molblock={container.content.molblock} />
                  }));

                  return ({ data: formatted_containers, pageInfo, totalCount });
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

GetContainerInventory.propTypes = {
  children: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(GetContainerInventory);
