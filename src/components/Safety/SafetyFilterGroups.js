const safetyFilterGroups = [
  {
    key:'sds',
    label: 'Safety Data Sheet',
    filters: [
      { key: 'hClass', path: 'h_class', label: 'Hazard Class', type: 'Multi' },
      { key: 'manufacturer', path: 'manufacturer', label: 'Manufacturer', type: 'Multi' },
      { key: 'signalWord', path: 'signal_word', label: 'Signal Word', type: 'Multi' },
      { key: 'pictograms', path: 'pictograms', label: 'Pictograms', type: 'Multi' },
    ]
  }
];
export default safetyFilterGroups;
