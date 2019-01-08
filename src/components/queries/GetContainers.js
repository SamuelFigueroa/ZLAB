import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProgressIndicator from '../ProgressIndicator';
import { withStyles } from '@material-ui/core/styles';

import GET_CONTAINERS from '../../graphql/containers/getContainers';

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

class GetContainers extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Query
            query={GET_CONTAINERS}
            skip={true}
          >
            { ({ client }) => {
              const callQuery = async (filter, search) => {
                try {
                  const { data, loading, error } = await client.query({
                    query: GET_CONTAINERS,
                    variables: { filter, search },
                    fetchPolicy: 'network-only'
                  });
                  if (loading) return <ProgressIndicator />;
                  if (error) return `Error!: ${error}`;
                  const { containers } = data;
                  let formatted_containers = containers.map( container => ({
                    ...container,
                    molblock: <StructureImage className={classes.image} molblock={container.content.molblock} />
                  }));

                  return formatted_containers;
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

GetContainers.propTypes = {
  children: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(GetContainers);