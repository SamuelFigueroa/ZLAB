import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProgressIndicator from '../ProgressIndicator';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import red from '@material-ui/core/colors/red';
import yellow from '@material-ui/core/colors/yellow';

import GET_SAFETY_DATA_SHEETS from '../../graphql/safety/getSafetyDataSheets';

import { Query } from 'react-apollo';
import ErrorHandler from '../mutations/ErrorHandler';
import StructureImage from '../Chemistry/StructureImage';
import Pictogram from '../Safety/Pictogram';

const styles = theme => ({
  image: {
    width: theme.spacing.unit * 6,
    height: theme.spacing.unit * 6,
    margin:'auto'
  },
  danger: {
    backgroundColor: red[500],
    color: theme.palette.common.white
  },
  warning: {
    backgroundColor: yellow[500],
    color: theme.palette.common.white
  }
});

class GetSafetyDataSheets extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Query
            query={GET_SAFETY_DATA_SHEETS}
            skip={true}
          >
            { ({ client }) => {
              const callQuery = async (variables, fetchPolicy) => {
                try {
                  const { data, loading, error } = await client.query({
                    query: GET_SAFETY_DATA_SHEETS,
                    variables,
                    fetchPolicy
                  });
                  if (loading) return <ProgressIndicator />;
                  if (error) return `Error!: ${error}`;
                  const { edges, pageInfo, totalCount } = data.safetyDataSheets.safetyDataSheetsConnection;
                  let formatted_sds = edges.map( ({ node: sds }) => ({
                    ...sds,
                    compound_id: sds.compound.compound_id,
                    name: sds.compound.name,
                    molblock: <StructureImage className={classes.image} molblock={sds.compound.molblock} />,
                    pictograms: sds.pictograms.map(p => <Pictogram className={classes.image} key={p} code={p} />),
                    signal_word: sds.signal_word ? <Chip className={classes[sds.signal_word.toLowerCase()]} clickable={false} label={sds.signal_word.toUpperCase()} /> : ''
                  }));

                  return ({ data: formatted_sds, pageInfo, totalCount });
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

GetSafetyDataSheets.propTypes = {
  children: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(GetSafetyDataSheets);
