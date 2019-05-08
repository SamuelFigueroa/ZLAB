import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Table from '../CheckableTable';

import GetLocations from '../queries/GetLocations';
import UpdateEquipmentLocations from '../mutations/UpdateEquipmentLocations';
import OnEquipmentInventorized from '../subscriptions/OnEquipmentInventorized';

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

const equipmentCols = [
  { id: 'name', numeric: false, label: 'Name' },
  { id: 'barcode', numeric: false, label: 'Barcode' },
  { id: 'model', numeric: false, label: 'Model' },
  { id: 'brand', numeric: false, label: 'Brand' },
  { id: 'formatted_location', numeric: false, label: 'Location' },
];

class EquipmentInventory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      detailsExpanded: false,
      equipment: [],
      area: '',
      sub_area: '',
    };
    this.toggleDetails = this.toggleDetails.bind(this);
    this.handleEquipmentInventorized = this.handleEquipmentInventorized.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit = (updateEquipmentLocations, clearErrors) => async e => {
    e.preventDefault();
    const { equipment, area, sub_area } = this.state;
    let ids = equipment.map(c=>c.id);
    const result = await updateEquipmentLocations(ids, area, sub_area);
    if(result !== undefined) {
      clearErrors();
      this.setState({
        equipment: [],
        area: '',
        sub_area: '',
        detailsExpanded: false,
      });
    }
  }

  toggleDetails = () => this.setState({ detailsExpanded: !this.state.detailsExpanded });

  handleEquipmentInventorized = scanned => {
    const { equipment } = this.state;
    const equipmentIDs = equipment.map(e=>e.id);
    if(!equipmentIDs.includes(scanned.id))
      this.setState({
        equipment: this.state.equipment.concat(scanned),
      });
  }

  render() {
    const { classes } = this.props;
    return(
      <OnEquipmentInventorized onEquipmentInventorized={this.handleEquipmentInventorized}>
        { () => (
          <UpdateEquipmentLocations>
            { (updateEquipmentLocations, errors, clearErrors) => (
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
                        Inventorize Equipment
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
                              this.state.equipment.length == 0}
                              onClick={this.handleSubmit(updateEquipmentLocations, clearErrors)}>
                                Submit
                            </Button>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <Table
                          cols={equipmentCols}
                          data={this.state.equipment}
                          title="Equipment Scanned"
                          editMode={false}
                          editable={false}
                          actions={{
                            delete: selected => {
                              let state = { equipment: this.state.equipment.filter(c=>!selected.includes(c.id)) };
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
          </UpdateEquipmentLocations>
        )}
      </OnEquipmentInventorized>
    );
  }
}

EquipmentInventory.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EquipmentInventory);
