import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProgressIndicator from '../ProgressIndicator';
import { withStyles } from '@material-ui/core/styles';

import FIND_CONTAINER from '../../graphql/containers/findContainer';

import { Query } from 'react-apollo';
import ErrorHandler from '../mutations/ErrorHandler';
import StructureImage from '../Chemistry/StructureImage';

const styles = theme => ({
  image: {
    width: theme.spacing.unit * 6,
    height: theme.spacing.unit * 6,
  }
});

const formatDate = (d) => {
  const date = new Date(d);
  date.setHours(date.getHours() + (date.getTimezoneOffset() / 60));
  const dateArr = new Intl.DateTimeFormat('en-US',
    { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date).split('/');
  const year = dateArr.pop();
  dateArr.unshift(year);
  return dateArr.join('-');
};

class FindContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;
    return(
      <ErrorHandler>
        { (handleError, errors, clearErrors) => (
          <Query
            query={FIND_CONTAINER}
            skip={true}
          >
            { ({ client }) => {
              const callQuery = async barcode => {
                try {
                  const { data, loading, error } = await client.query({
                    query: FIND_CONTAINER,
                    variables: { barcode },
                    fetchPolicy: 'network-only'
                  });
                  if (loading) return <ProgressIndicator />;
                  if (error) return `Error!: ${error}`;
                  const { barcodedContainer: container } = data;
                  let formatted_container = {
                    ...container,
                    molblock: <StructureImage className={classes.image} molblock={container.content.molblock} />,
                    formatted_location: (container.location.area.name == 'UNASSIGNED') ?
                      'UNASSIGNED' : `${container.location.area.name} / ${container.location.sub_area.name}`,
                    source: container.vendor ? container.vendor : container.institution,
                    source_id: container.vendor ? container.catalog_id : container.researcher,
                    registration_event:
                      {...container.registration_event, date: formatDate(container.registration_event.date) },
                  };
                  return formatted_container;
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

FindContainer.propTypes = {
  children: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(FindContainer);
