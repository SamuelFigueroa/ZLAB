import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Select from '../Select';

import NormalizationTable from './NormalizationTable';
import UpdateLocationNormalization from '../mutations/UpdateLocationNormalization';
import GetLocations from '../queries/GetLocations';

const locationCols = [
  { key: 'unregisteredLocation', alphanumeric: true, label: 'Unregistered Location' },
  { key: 'registerLocationAs', alphanumeric: false, label: 'Register As' },
];
class LocationNormalizationTable extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { data, navigate } = this.props;
    if(data !== null && data.length === 0)
      navigate();
  }

  render() {
    const { data } = this.props;
    return (
      <UpdateLocationNormalization>
        { updateLocationNormalization =>
          <NormalizationTable
            cols={locationCols}
            title="Unregistered Locations"
            data={data.map(entry=>({
              ...entry,
              unregisteredLocation: `${entry.unregistered.area} / ${entry.unregistered.sub_area}`,
              registerLocationAs: entry.registerAs === null ? `${entry.unregistered.area} / ${entry.unregistered.sub_area}`
                : `${entry.registerAs.area} / ${entry.registerAs.sub_area}`
            }))}
            onRowClick={id => {
              const selectedEntry = data.find(entry => entry.id === id);
              return ({
                selectedEntryID: id,
                currentField: 'location',
                unregisteredValue:`${selectedEntry.unregistered.area} / ${selectedEntry.unregistered.sub_area}`
              });
            }}
            onReset={input=>updateLocationNormalization({ id: input.selectedEntryID, registerAs: null })}
            onSave={input=>updateLocationNormalization({ id: input.selectedEntryID, registerAs: input.currentValue[0].value })}
            inputComponent={ inputProps =>
              <GetLocations>
                { locations =>
                  <Select
                    options={locations.reduce( (acc, loc) => acc
                      .concat(loc.area.sub_areas
                        .map(sub_area => ({ label: `${loc.area.name} / ${sub_area.name}`, value: {
                          area: loc.area.name,
                          sub_area: sub_area.name
                        }}))), [])}
                    label=""
                    value={inputProps.value}
                    onChange={inputProps.onChange}
                    isMulti={false} />
                }
              </GetLocations>
            }
          />
        }
      </UpdateLocationNormalization>
    );
  }
}

LocationNormalizationTable.propTypes = {
  data: PropTypes.array.isRequired,
  navigate: PropTypes.func.isRequired,
};

export default LocationNormalizationTable;
