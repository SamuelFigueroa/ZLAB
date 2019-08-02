import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';

import Select from '../Select';

import NormalizationTable from './NormalizationTable';
import UpdateUserNormalization from '../mutations/UpdateUserNormalization';
import GetUsers from '../queries/GetUsers';

const userCols = [
  { key: 'unregistered', alphanumeric: true, label: 'Unregistered Owner' },
  { key: 'registerUserAs', alphanumeric: false, label: 'Register As' },
];

class UserNormalizationTable extends Component {
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
      <UpdateUserNormalization>
        { updateUserNormalization =>
          <NormalizationTable
            cols={userCols}
            title="Unregistered Owners"
            data={data.map(entry=>({
              ...entry,
              registerUserAs: entry.registerAs === null ? <Typography variant="body1" color="error">Mapping Required</Typography>
                : entry.registerAs
            }))}
            onRowClick={id => {
              const selectedEntry = data.find(entry => entry.id === id);
              return ({
                selectedEntryID: id,
                currentField: 'user',
                unregisteredValue: selectedEntry.unregistered
              });
            }}
            onReset={input=>updateUserNormalization({ id: input.selectedEntryID, registerAs: null })}
            onSave={input=>updateUserNormalization({ id: input.selectedEntryID, registerAs: input.currentValue[0].value })}
            inputComponent={ inputProps =>
              <GetUsers>
                { users =>
                  <Select
                    options={users.map(user => ({ label: user.name, value: user.login }))}
                    label=""
                    value={inputProps.value}
                    onChange={inputProps.onChange}
                    isMulti={false} />
                }
              </GetUsers>
            }
          />
        }
      </UpdateUserNormalization>
    );
  }
}

UserNormalizationTable.propTypes = {
  data: PropTypes.array.isRequired,
  navigate: PropTypes.func.isRequired,
};

export default UserNormalizationTable;
