import isEmpty from './is-empty';

export default data => {
  let errors = {};
  let input = {
    purchasing_info: ['price', 'date', 'warranty_exp'],
    maintenance_log: ['date', 'scheduled'],
    registration_event: ['date'],
    purchase_log: ['date', 'received']
  };

  const validateRange = (field, subfield) => {
    if (data[field] !== undefined && data[field][subfield] !== undefined) {
      const range = data[field][subfield];
      if ((range.min !== undefined) && (range.max !== undefined) && (range.min > range.max)) {
        return errors[`${field}.${subfield}`] = `Invalid ${subfield} range`;
      }
    }
  };

  Object.keys(input).forEach(key => {
    let ranges = input[key];
    return ranges.forEach(range => validateRange(key, range));
  });

  if(data.category !== undefined) {
    if(data.category == 'Lab Equipment') {
      return {
        errors: { equipment: errors },
        isValid: isEmpty(errors)
      };
    }
    return {
      errors: { consumables: errors },
      isValid: isEmpty(errors)
    };
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
