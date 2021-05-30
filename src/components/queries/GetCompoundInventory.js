import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProgressIndicator from '../ProgressIndicator';
import { withStyles } from '@material-ui/core/styles';

import GET_COMPOUND_INVENTORY from '../../graphql/compounds/getCompoundInventory';

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

class GetCompoundInventory extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Query
            query={GET_COMPOUND_INVENTORY}
            skip={true}
          >
            { ({ client }) => {
              const callQuery = async variables => {
                try {
                  const { data, loading, error } = await client.query({
                    query: GET_COMPOUND_INVENTORY,
                    variables,
                    fetchPolicy: 'network-only'
                  });
                  if (loading) return <ProgressIndicator />;
                  if (error) return `Error!: ${error}`;
                  const { edges, pageInfo, totalCount } = data.compoundInventory.compoundsConnection;
                  let formatted_compounds = edges.map( ({ node: compound }) => ({
                    ...compound,
                    molblock: <StructureImage className={classes.image} molblock={compound.molblock} />
                  }));

                  return ({ data: formatted_compounds, pageInfo, totalCount });
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

GetCompoundInventory.propTypes = {
  children: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(GetCompoundInventory);
