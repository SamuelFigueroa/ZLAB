import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Select from '../Select';

import NormalizationTable from './NormalizationTable';
import GetContainerHints from '../queries/GetContainerHints';
import UpdateContainerNormalization from '../mutations/UpdateContainerNormalization';

const containerInfoCols = [
  { key: 'field', alphanumeric: true, label: 'Field'},
  { key: 'unregistered', alphanumeric: true, label: 'Unregistered Value' },
  { key: 'registerAs', alphanumeric: false, label: 'Register As' },
];
class ContainerNormalizationTable extends Component {
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
      <UpdateContainerNormalization>
        { updateContainerNormalization =>
          <NormalizationTable
            cols={containerInfoCols}
            title="Unregistered Container Info"
            data={data.map(entry=>({
              ...entry,
              registerAs: entry.registerAs === null ? entry.unregistered
                : entry.registerAs
            }))}
            onRowClick={id => {
              const selectedEntry = data.find(entry => entry.id === id);
              return ({
                selectedEntryID: id,
                currentField: selectedEntry.field.toLowerCase(),
                unregisteredValue: selectedEntry.unregistered,
              });
            }}
            onReset={input=>updateContainerNormalization({ id: input.selectedEntryID, registerAs: null })}
            onSave={input=>updateContainerNormalization({ id: input.selectedEntryID, registerAs: input.currentValue[0].value })}
            inputComponent={ inputProps =>
              <GetContainerHints>
                { containerHints =>
                  <Select
                    options={containerHints[inputProps.field].map(o => ({ label: o, value: o }))}
                    label=""
                    value={inputProps.value}
                    onChange={inputProps.onChange}
                    isMulti={false} />
                }
              </GetContainerHints>
            }
          />
        }
      </UpdateContainerNormalization>
    );
  }
}

ContainerNormalizationTable.propTypes = {
  data: PropTypes.array.isRequired,
  navigate: PropTypes.func.isRequired,
};

export default ContainerNormalizationTable;
