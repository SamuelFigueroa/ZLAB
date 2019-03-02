import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Table from '../CheckableTable';
import ContainerInfoPanel from './ContainerInfoPanel';

import GetLocations from '../queries/GetLocations';
import UpdateContainerLocations from '../mutations/UpdateContainerLocations';
import OnContainerInventorized from '../subscriptions/OnContainerInventorized';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
  },
  title: {
    paddingBottom: theme.spacing.unit * 6
  },
  button: {
    marginTop: theme.spacing.unit * 2
  },
  notificationBar: {
    margin: theme.spacing.unit
  }
});

const containerCols = [
  { id: 'molblock', numeric: false, label: 'Structure', exclude: true },
  { id: 'barcode', numeric: false, label: 'Barcode' },
  { id: 'batch_id', numeric: false, label: 'Batch ID' },
  { id: 'formatted_location', numeric: false, label: 'Location' },
];

class RFIDInventory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      detailsExpanded: false,
      selectedEntry: null,
      containers: [],
      area: '',
      sub_area: '',
    };
    this.toggleDetails = this.toggleDetails.bind(this);
    this.handleRowClick = this.handleRowClick.bind(this);
    this.handleContainerInventorized = this.handleContainerInventorized.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit = (updateContainerLocations, clearErrors) => async e => {
    e.preventDefault();
    const { containers, area, sub_area } = this.state;
    let ids = containers.map(c=>c.id);
    const result = await updateContainerLocations(ids, area, sub_area);
    if(result !== undefined) {
      clearErrors();
      this.setState({
        containers: [],
        area: '',
        sub_area: '',
        detailsExpanded: false,
        selectedEntry: null,
      });
    }
  }

  toggleDetails = () => this.setState({ detailsExpanded: !this.state.detailsExpanded });

  handleRowClick = containerID => () => {
    const selectedEntry = this.state.containers.find(container => container.id == containerID );
    this.setState({ selectedEntry });
  }

  handleContainerInventorized = scanned => {
    const { containers } = this.state;
    const containerIDs = containers.map(container=>container.id);
    if(!containerIDs.includes(scanned.id))
      this.setState({
        containers: this.state.containers.concat(scanned),
      });
  }

  render() {
    const { classes } = this.props;
    const { selectedEntry } = this.state;
    return(
      <OnContainerInventorized onContainerInventorized={this.handleContainerInventorized}>
        { () => (
          <UpdateContainerLocations>
            { (updateContainerLocations, errors, clearErrors) => (
              <GetLocations>
                { locations => (
                  <div className={classes.root}>
                    <Grid
                      container
                      justify="center"
                      alignItems="center"
                    >
                      <Grid item xs={12}>
                        <Typography align="center" variant="display1" className={classes.title}>
                        Inventorize Reagents
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Grid
                          container
                          alignItems="flex-start"
                          spacing={16}>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              name="area"
                              label="Area"
                              fullWidth
                              select
                              margin="none"
                              value={this.state.area}
                              onChange={e => this.setState({ area: e.target.value, sub_area: '' })}
                              error={Boolean(errors.area)}
                              helperText={errors.area}
                            >
                              {locations.map(location => (
                                <MenuItem key={location.id} value={location.id}>
                                  {location.area.name}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              name="sub_area"
                              label="Sub-Area"
                              fullWidth
                              select
                              margin="none"
                              value={this.state.sub_area}
                              onChange={e=>this.setState({ sub_area: e.target.value })}
                              error={Boolean(errors.sub_area)}
                              helperText={errors.sub_area}
                            >
                              {
                                this.state.area ? (
                                  locations.find(location => location.id === this.state.area).area.sub_areas.map(sub_area => (
                                    <MenuItem key={sub_area.id} value={sub_area.id}>
                                      {sub_area.name}
                                    </MenuItem>
                                  ))) : (
                                  <MenuItem value=''></MenuItem>
                                )}
                            </TextField>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Button variant="contained" color="primary" className={classes.button} fullWidth
                              disabled={this.state.area == '' ||
                              this.state.sub_area == '' ||
                              this.state.containers.length == 0}
                              onClick={this.handleSubmit(updateContainerLocations, clearErrors)}>
                                Submit
                            </Button>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <ContainerInfoPanel
                          expanded={this.state.detailsExpanded}
                          container={selectedEntry}
                          toggleDetails={this.toggleDetails}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Table
                          cols={containerCols}
                          data={this.state.containers}
                          title="Containers Scanned"
                          editMode={false}
                          editable={false}
                          actions={{
                            delete: selected => {
                              let state = { containers: this.state.containers.filter(c=>!selected.includes(c.id)) };
                              if(this.state.selectedEntry !== null && selected.includes(this.state.selectedEntry.id))
                                state.selectedEntry = null;
                              this.setState(state);
                            },
                          }}
                          onRowClick={this.handleRowClick}
                        />
                      </Grid>
                    </Grid>
                  </div>
                )}
              </GetLocations>
            )}
          </UpdateContainerLocations>
        )}
      </OnContainerInventorized>
    );
  }
}

RFIDInventory.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RFIDInventory);
