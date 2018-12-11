import isEmpty from './is-empty';

const units = {
  n: 0.001,
  u: 1,
  m: 1000,
  k: 1000000000,
  g: 1000000,
  M: 1000000,
  L: 1000000
};

export default (d, query) => {
  let errors = {};
  let data = {...d, container: d.container !== undefined ? { ...d.container } : undefined };
  if(data.container !== undefined && data.container.registration_event !== undefined) {
    if(data.container.registration_event.date !== undefined)
      data['container.registration_event'] = data.container.registration_event;
  }

  let input = {
    container: ['mass', 'volume', 'concentration'],
    'container.registration_event' : ['date'],
    registration_event: ['date'],
  };

  let unit_fields = {
    mass: 'mass_units',
    volume: 'vol_units',
    concentration: 'conc_units'
  };

  const validateRange = (field, subfield) => {
    if (data[field] !== undefined && data[field][subfield] !== undefined) {
      const range = data[field][subfield];
      if ((range.min !== undefined) && (range.max !== undefined)) {
        if(Object.keys(unit_fields).indexOf(subfield) != -1) {
          if (range.min * (units[data[field][unit_fields[subfield]].min[0]]) > range.max * (units[data[field][unit_fields[subfield]].max[0]]))
            return errors[`${field}.${subfield}`] = `Invalid ${subfield} range`;
        }
        if (range.min > range.max)
          return errors[`${field}.${subfield}`] = `Invalid ${subfield} range`;
      }
    }
  };

  Object.keys(input).forEach(key => {
    let ranges = input[key];
    return ranges.forEach(range => validateRange(key, range));
  });

  return {
    errors: { [query]: errors },
    isValid: isEmpty(errors)
  };
};
