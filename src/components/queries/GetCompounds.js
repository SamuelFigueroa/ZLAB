import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProgressIndicator from '../ProgressIndicator';
import { withStyles } from '@material-ui/core/styles';

import GET_COMPOUNDS from '../../graphql/compounds/getCompounds';

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

class GetCompounds extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Query
            query={GET_COMPOUNDS}
            skip={true}
          >
            { ({ client }) => {
              const callQuery = async (filter, search) => {
                try {
                  const { data, loading, error } = await client.query({
                    query: GET_COMPOUNDS,
                    variables: { filter, search },
                    fetchPolicy: 'network-only'
                  });
                  if (loading) return <ProgressIndicator />;
                  if (error) return `Error!: ${error}`;
                  const { compounds } = data;
                  let formatted_compounds = compounds.map( compound => ({
                    ...compound,
                    molblock: <StructureImage className={classes.image} molblock={compound.molblock} />
                  }));

                  return formatted_compounds;
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

GetCompounds.propTypes = {
  children: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(GetCompounds);
