const chemistryFilterGroups = [
  {
    key:'compound',
    label: 'Compound',
    filters: [
      { key: 'attributes', path: 'attributes', label: 'Attributes', type: 'Multi' },
      { key: 'storage', path: 'storage', label: 'Storage', type: 'Multi' },
      { key: 'registrationEventUser', path: 'registration_event.user', label: 'Registered By', type: 'Multi'},
      { key: 'registrationEventDate', path: 'registration_event.date', label: 'Date Registered', type: 'DateRange' },
    ]
  },{
    key: 'container',
    label: 'Container',
    filters: [
      { key: 'containerCategory', path: 'container.category', label: 'Category', type: 'Single' },
      { key: 'containerVendor', path: 'container.vendor', label: 'Vendor', type: 'Multi' },
      { key: 'containerInstitution', path: 'container.institution', label: 'Institution', type: 'Multi' },
      { key: 'containerResearcher', path: 'container.researcher', label: 'Researcher', type: 'Multi' },
      { key: 'containerLocation', path: 'container.location', label: 'Location', type: 'Multi' },
      { key: 'containerRegistrationEventUser', path: 'container.registration_event.user', label: 'Registered By', type: 'Multi' },
      { key: 'containerRegistrationEventDate', path: 'container.registration_event.date', label: 'Date Registered', type: 'DateRange' },
      { key: 'containerMass', path: 'container.mass', label: 'Mass', type: 'MeasurementRange', units: 'container.mass_units' },
      { key: 'containerVolume', path: 'container.volume', label: 'Vol.', type: 'MeasurementRange', units: 'container.vol_units' },
      { key: 'containerConcentration', path: 'container.concentration', label: 'Conc.', type: 'MeasurementRange', units: 'container.conc_units' },
      { key: 'containerSolvent', path: 'container.solvent', label: 'Solvent', type: 'Multi' },
      { key: 'containerState', path: 'container.state', label: 'State', type: 'Multi' },
      { key: 'containerOwner', path: 'container.owner', label: 'Owner', type: 'Multi' },
    ]
  }
];
export default chemistryFilterGroups;
