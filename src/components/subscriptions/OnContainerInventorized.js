import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import CONTAINER_INVENTORIZED from '../../graphql/containers/containerInventorized';

import { Subscription } from 'react-apollo';
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

class OnContainerInventorized extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes, onContainerInventorized } = this.props;
    return(
      <Subscription
        subscription={CONTAINER_INVENTORIZED}
        onSubscriptionData={({ subscriptionData: { data: { containerInventorized: container }}}) => {
          let formatted_container = {
            ...container,
            molblock: <StructureImage className={classes.image} molblock={container.content.molblock} />,
            formatted_location: (container.location.area.name == 'UNASSIGNED') ?
              'UNASSIGNED' : `${container.location.area.name} / ${container.location.sub_area.name}`,
            source: container.vendor ? container.vendor : container.institution,
            source_id: container.vendor ? container.catalog_id : container.researcher,
            registration_event:{
              ...container.registration_event,
              date: formatDate(container.registration_event.date)
            },
          };
          return onContainerInventorized(formatted_container);
        }}
      >
        { this.props.children }
      </Subscription>
    );
  }
}

OnContainerInventorized.propTypes = {
  children: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  onContainerInventorized: PropTypes.func.isRequired
};

export default withStyles(styles)(OnContainerInventorized);
