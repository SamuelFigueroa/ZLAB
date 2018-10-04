import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Zoom from '@material-ui/core/Zoom';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import green from '@material-ui/core/colors/green';


import Table from './CheckableTable';
import PurchaseEventForm from './PurchaseEventForm';
import DeletePurchaseEvent from './mutations/DeletePurchaseEvent';

const styles = (theme) => ({
  fab: {
    float: 'right',
    position: 'relative',
    left: theme.spacing.unit * 2,
    bottom: theme.spacing.unit * 3,
    zIndex: 10
  },
  fabGreen: {
    float: 'right',
    position: 'relative',
    left: theme.spacing.unit * 2,
    bottom: theme.spacing.unit * 3,
    zIndex: 10,
    color: theme.palette.common.white,
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
});

const purchaseCols = [
  { id: 'date', numeric: false, label: 'Date' },
  { id: 'supplier', numeric: false, label: 'Supplier' },
  { id: 'catalog_number', numeric: false, label: 'Catalog No.' },
  { id: 'price', numeric: false, label: 'Price' },
  { id: 'quantity', numeric: false, label: 'Quantity' },
  { id: 'received', numeric: false, label: 'Date Received' },
];

const formatDate = (d) => {
  const date = new Date(d);
  date.setHours(date.getHours() + (date.getTimezoneOffset() / 60));
  const dateArr = new Intl.DateTimeFormat('en-US',
    { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date).split('/');
  const year = dateArr.pop();
  dateArr.unshift(year);
  return dateArr.join('-');
};

const formatCurrency = (n) => new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD' }).format(n);

class PurchaseLog extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      editMode: false,
      currentEntry: null
    };
    this.toggleEventForm = this.toggleEventForm.bind(this);
  }

  static contextTypes = {
    swipeableViews: PropTypes.object.isRequired,
  };

  componentDidUpdate() {
    setTimeout(() => this.context.swipeableViews.slideUpdateHeight(), this.props.theme.transitions.duration.shortest);
  }

  toggleEventForm = () => {
    const { expanded } = this.state;
    if(this.state.editMode)
      this.setState({ expanded: !expanded, editMode: false, currentEntry: null });
    else {
      this.setState({ expanded: !expanded });
    }
  };

  toggleEditMode = (eventID) => {
    const currentEntry = this.props.events.find(event => event.id == eventID );
    this.setState({
      expanded: !this.state.editMode,
      currentEntry: !this.state.editMode ? currentEntry : null,
      editMode: !this.state.editMode });
  }

  render() {
    const { classes, theme, events, assetID, assetHeadline } = this.props;
    const { currentEntry } = this.state;
    const fabs = [
      {
        color: 'primary',
        tooltip: 'Add Resupply Event',
        icon: <AddIcon />,
        className: classes.fab
      },
      {
        color: 'inherit',
        tooltip: 'Edit Mode',
        icon: <EditIcon />,
        className: classes.fabGreen
      },
    ];

    const transitionDuration = {
      enter: theme.transitions.duration.enteringScreen,
      exit: 0,
    };

    const formatted_events = events.map(event => ({
      ...event,
      date: formatDate(event.date),
      received: event.received && formatDate(event.received),
      price: formatCurrency(event.price).slice(1),
      quantity: event.quantity.toString()
    }));

    return (
      <DeletePurchaseEvent>
        { deletePurchaseEvent => (
          <div>
            {fabs.map((fab, index) => (
              <Zoom
                key={fab.color}
                in={Number(this.state.expanded) === index}
                timeout={transitionDuration}
                mountOnEnter
                unmountOnExit
              >
                <Button variant="fab" className={fab.className} color={fab.color} onClick={this.toggleEventForm}>
                  {fab.icon}
                </Button>
              </Zoom>
            ))}
            <Table
              cols={purchaseCols}
              data={formatted_events}
              title="Purchase Log"
              subheading={assetHeadline}
              editMode={this.state.editMode}
              editable={true}
              actions={{
                delete: deletePurchaseEvent(assetID),
                update: this.toggleEditMode
              }}/>
            <PurchaseEventForm
              initialState={currentEntry}
              expanded={this.state.expanded}
              assetID={assetID}
              toggleForm={this.toggleEventForm}
              editMode={this.state.editMode}/>
          </div>
        )}
      </DeletePurchaseEvent>
    );
  }
}

PurchaseLog.propTypes = {
  classes: PropTypes.object.isRequired,
  events: PropTypes.array.isRequired,
  theme: PropTypes.object.isRequired,
  assetID: PropTypes.string.isRequired,
  assetHeadline: PropTypes.string.isRequired,
};

export default withStyles(styles, { withTheme: true })(PurchaseLog);
