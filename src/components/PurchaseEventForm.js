import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import InputAdornment from '@material-ui/core/InputAdornment';
import Autocomplete from './Autocomplete';

import GetAssetHints from './queries/GetAssetHints';
import AddPurchaseEvent from './mutations/AddPurchaseEvent';
import UpdatePurchaseEvent from './mutations/UpdatePurchaseEvent';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
  },
  input: {
    display: 'none',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  icon: {
    verticalAlign: 'bottom',
    height: 20,
    width: 20,
  },
  details: {
    alignItems: 'center',
  },
  column: {
    flexBasis: '33.33%',
  },
  helper: {
    borderLeft: `2px solid ${theme.palette.divider}`,
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  panelButton: {
    float: 'left'
  },
  panelActions: {
    padding: theme.spacing.unit * 3
  }
});

const formatCurrency = (n) => new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD' }).format(n);

const formatDate = (d) => {
  const date = new Date(d);
  date.setHours(date.getHours() + (date.getTimezoneOffset() / 60));
  const dateArr = new Intl.DateTimeFormat('en-US',
    { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date).split('/');
  const year = dateArr.pop();
  dateArr.unshift(year);
  return dateArr.join('-');
};

class PurchaseEventForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state= {
      eventID: '',
      date: '',
      supplier: '',
      catalog_number: '',
      price: 0.00,
      rendered_price: '0.00',
      quantity: 0,
      received: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.syncRenderedPrice = this.syncRenderedPrice.bind(this);
  }

  static contextTypes = {
    swipeableViews: PropTypes.object.isRequired,
  };

  componentDidUpdate(prevProps) {
    setTimeout(() => this.context.swipeableViews.slideUpdateHeight(), this.props.theme.transitions.duration.shortest);
    if(this.props.editMode && !prevProps.editMode) {
      this.setState({
        eventID: this.props.initialState.id,
        date: formatDate(this.props.initialState.date),
        supplier: this.props.initialState.supplier,
        catalog_number: this.props.initialState.catalog_number,
        price: this.props.initialState.price,
        rendered_price: formatCurrency(this.props.initialState.price).slice(1),
        quantity: this.props.initialState.quantity,
        received: this.props.initialState.received ?
          formatDate(this.props.initialState.received) : '',
      });
    }
    if(prevProps.editMode && !this.props.editMode) {
      this.setState({
        eventID: '',
        date: '',
        supplier: '',
        catalog_number: '',
        price: 0.00,
        rendered_price: '0.00',
        quantity: 0,
        received: ''
      });
    }
  }

  handleChange = e => {
    if(e.target.name == 'quantity') {
      const quantity = parseInt(e.target.value);
      return this.setState({ quantity: (isNaN(quantity) || quantity < 0) ? 0 : (
        quantity ) });
    }

    if (e.target.name === 'rendered_price')
      return this.setState({ price: parseFloat(formatCurrency(parseFloat(e.target.value.replace(/,/g, ''))).slice(1).replace(/,/g, '')), rendered_price: e.target.value });

    return this.setState({ [e.target.name] : e.target.value });

  }

  handleClose = (clearErrors, toggleForm) => () => {
    this.setState({
      eventID: '',
      date: '',
      supplier: '',
      catalog_number: '',
      price: 0.00,
      rendered_price: '0.00',
      quantity: 0,
      received: ''
    });
    clearErrors();
    return toggleForm();
  }

  handleSubmit = (callAction, assetID, handleClose) => async e => {
    e.preventDefault();
    const { eventID, rendered_price, ...eventInput } = this.state;
    const event = { ...eventInput, assetID };
    if (this.props.editMode)
      event.eventID = eventID;
    const result = await callAction(event);
    if(result !== undefined) handleClose();
  }

  syncRenderedPrice = () => {
    return this.setState({ rendered_price: isNaN(this.state.price) ? '' : formatCurrency(this.state.price).slice(1) });
  }

  render() {
    const { classes, expanded, theme, assetID, toggleForm, editMode } = this.props;
    const Action = editMode ? UpdatePurchaseEvent : AddPurchaseEvent;
    return (
      <GetAssetHints category="Lab Supplies">
        { supplyHints => (
          <Action>
            { (callAction, errors, clearErrors) => (
              <form className={classes.container}
                onSubmit={this.handleSubmit(callAction, assetID, this.handleClose(clearErrors, toggleForm) )}
                noValidate
                autoComplete="off">
                <div className={classes.root}>
                  <ExpansionPanel expanded={expanded} CollapseProps={{
                    timeout: {
                      enter: 0,
                      exit: theme.transitions.duration.shortest
                    }
                  }}>
                    <ExpansionPanelSummary onClick={toggleForm}>
                      <div className={classes.column}>
                        <Typography className={classes.heading}>
                          {`${ editMode ? 'Edit' : 'Add' } Resupply Event`}
                        </Typography>
                      </div>
                      <div className={classes.column}>
                        <Typography className={classes.secondaryHeading}>
                          {editMode ? 'Update log entry' : 'Create a new log entry' }
                        </Typography>
                      </div>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className={classes.details}>
                      <Grid
                        container
                        alignItems="flex-start"
                        spacing={16}>
                        <Grid item xs={3}>
                          <TextField
                            name="date"
                            label="Date"
                            type="date"
                            fullWidth
                            margin="normal"
                            value={this.state.date}
                            onChange={this.handleChange}
                            error={Boolean(errors.date)}
                            helperText={errors.date}
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <Autocomplete
                            options={supplyHints.purchase_log.supplier}
                            textFieldProps={{
                              name: 'supplier',
                              label: 'Supplier',
                              margin: 'normal',
                              value: this.state.supplier,
                              onChange: this.handleChange,
                              error: Boolean(errors.supplier),
                              helperText: errors.supplier
                            }}>
                          </Autocomplete>
                        </Grid>
                        <Grid item xs={3}>
                          <TextField
                            name="catalog_number"
                            label="Catalog No."
                            fullWidth
                            margin="normal"
                            value={this.state.catalog_number}
                            onChange={this.handleChange}
                            error={Boolean(errors.catalog_number)}
                            helperText={errors.catalog_number}
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <ClickAwayListener onClickAway={this.syncRenderedPrice}>
                            <TextField
                              name="rendered_price"
                              label="Price"
                              margin="normal"
                              fullWidth
                              value={this.state.rendered_price}
                              onChange={this.handleChange}
                              error={Boolean(errors.price)}
                              helperText={errors.price}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    $
                                  </InputAdornment>
                                )
                              }}
                            />
                          </ClickAwayListener>
                        </Grid>
                        <Grid item xs={3}>
                          <TextField
                            name="quantity"
                            label="Quantity"
                            fullWidth
                            margin="normal"
                            value={this.state.quantity}
                            onChange={this.handleChange}
                            error={Boolean(errors.quantity)}
                            helperText={errors.quantity}
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <TextField
                            name="received"
                            label="Date Received"
                            type="date"
                            fullWidth
                            margin="normal"
                            value={this.state.received}
                            onChange={this.handleChange}
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        </Grid>
                      </Grid>
                    </ExpansionPanelDetails>
                    <Divider />
                    <ExpansionPanelActions>
                      <Grid
                        container
                        justify="flex-start"
                        alignItems="center"
                        spacing={16}>
                        <Grid item>
                          <input type="submit" id="register-button" className={classes.input}/>
                          <label htmlFor="register-button">
                            <Button variant="contained" color="primary" component="span">
                              Save
                            </Button>
                          </label>
                        </Grid>
                        <Grid item>
                          <Button variant="contained" color="secondary" onClick={this.handleClose(clearErrors, toggleForm)}>
                            Cancel
                          </Button>
                        </Grid>
                      </Grid>
                    </ExpansionPanelActions>
                  </ExpansionPanel>
                </div>
              </form>
            )}
          </Action>
        )}
      </GetAssetHints>
    );
  }
}

PurchaseEventForm.propTypes = {
  classes: PropTypes.object.isRequired,
  expanded: PropTypes.bool.isRequired,
  theme: PropTypes.object.isRequired,
  assetID: PropTypes.string.isRequired,
  toggleForm: PropTypes.func.isRequired,
  initialState: PropTypes.object,
  editMode: PropTypes.bool.isRequired
};

export default withStyles(styles, { withTheme: true })(PurchaseEventForm);
