import React from 'react';
import PropTypes from 'prop-types';
import GetLocations from '../queries/GetLocations';
import GetUsers from '../queries/GetUsers';
import GetReagentHints from '../queries/GetReagentHints';

const states = [
  { value: 'S', label: 'Solid' },
  { value: 'L', label: 'Liquid' },
  { value: 'G', label: 'Gas' },
  { value: 'Soln', label: 'Solution' },
  { value: 'Susp', label: 'Suspension' }
];

const ReagentFilterOptions = (props) => (
  <GetUsers>
    { users => (
      <GetLocations>
        { locations => (
          <GetReagentHints>
            { reagentHints => {
              let options = {
                'attributes': reagentHints.attributes.map(attribute => ({ label: attribute, value: attribute })),
                'flags': reagentHints.flags.map(flag => ({ label: flag, value: flag })),
                'storage': reagentHints.storage.map(s => ({ label: s, value: s })),
                'registration_event.user': users.map(user => ({ label: user.name, value: user.id })),
                'containers.vendor': reagentHints.containers.vendor.map(v => ({ label: v, value: v })),
                'containers.state': states,
                'containers.institution': reagentHints.containers.institution.map(i => ({ label: i, value: i })),
                'containers.chemist': reagentHints.containers.chemist.map(c => ({ label: c, value: c })),
                'containers.mass_units': ['kg', 'g', 'mg', 'ug'],
                'containers.vol_units': ['L', 'mL', 'uL', 'nL'],
                'containers.conc_units': ['M', 'mM', 'uM', 'nM'],
                'containers.solvent': reagentHints.containers.solvent.map(s => ({ label: s, value: s })),
                'containers.location':
                     locations.reduce( (acc, loc) => acc
                       .concat(loc.area.sub_areas
                         .map(sub_area => ({ label: `${loc.area.name} / ${sub_area.name}`, value: sub_area.id }))), []),
                'containers.registration_event.user': users.map(user => ({ label: user.name, value: user.id })),
                'containers.owner': users.map(user => ({ label: user.name, value: user.id })),
              };
              return props.children(options);
            }}
          </GetReagentHints>
        )}
      </GetLocations>
    )}
  </GetUsers>
);

ReagentFilterOptions.propTypes = {
  children: PropTypes.func.isRequired,
};

export default ReagentFilterOptions;
