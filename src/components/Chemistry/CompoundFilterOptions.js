import React from 'react';
import PropTypes from 'prop-types';
import GetLocations from '../queries/GetLocations';
import GetUsers from '../queries/GetUsers';
import GetCompoundHints from '../queries/GetCompoundHints';
import GetContainerHints from '../queries/GetContainerHints';


const states = [
  { value: 'S', label: 'Solid' },
  { value: 'L', label: 'Liquid' },
  { value: 'G', label: 'Gas' },
  { value: 'Soln', label: 'Solution' },
  { value: 'Susp', label: 'Suspension' }
];

const categories = [
  { value: 'Reagent', label: 'Reagent' },
  { value: 'Sample', label: 'Sample' },
];

const CompoundFilterOptions = (props) => (
  <GetUsers>
    { users => (
      <GetLocations>
        { locations => (
          <GetCompoundHints>
            { compoundHints => (
              <GetContainerHints>
                { containerHints => {
                  let options = {
                    'attributes': compoundHints.attributes.map(attribute => ({ label: attribute, value: attribute })),
                    'storage': compoundHints.storage.map(s => ({ label: s, value: s })),
                    'registration_event.user': users.map(user => ({ label: user.name, value: user.login })),
                    'container.category': categories,
                    'container.vendor': containerHints.vendor.map(v => ({ label: v, value: v })),
                    'container.state': states,
                    'container.institution': containerHints.institution.map(i => ({ label: i, value: i })),
                    'container.researcher': containerHints.researcher.map(c => ({ label: c, value: c })),
                    'container.mass_units': ['kg', 'g', 'mg', 'ug'],
                    'container.vol_units': ['L', 'mL', 'uL', 'nL'],
                    'container.conc_units': ['M', 'mM', 'uM', 'nM'],
                    'container.solvent': containerHints.solvent.map(s => ({ label: s, value: s })),
                    'container.location':
                         locations.reduce( (acc, loc) => acc
                           .concat(loc.area.sub_areas
                             .map(sub_area => ({ label: `${loc.area.name} / ${sub_area.name}`, value: sub_area.id }))), []),
                    'container.registration_event.user': users.map(user => ({ label: user.name, value: user.login })),
                    'container.owner': users.map(user => ({ label: user.name, value: user.id })),
                  };
                  return props.children(options);
                }}
              </GetContainerHints>
            )}
          </GetCompoundHints>
        )}
      </GetLocations>
    )}
  </GetUsers>
);

CompoundFilterOptions.propTypes = {
  children: PropTypes.func.isRequired,
};

export default CompoundFilterOptions;
