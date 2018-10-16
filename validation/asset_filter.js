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

  // const { date, price } = data.purchasing_info;
  // date.min = !isEmpty(date.min) ? date.min : '';
  // date.max = !isEmpty(date.max) ? date.max : '';
  // price.min = !isEmpty(price.min) ? price.min : '';
  // price.max = !isEmpty(price.max) ? price.max : '';
  //
  // if(!Validator.isEmpty(date.min) &&
  //    !Validator.isEmpty(date.max) &&
  //     date.min > date.max) {
  //   errors.purchasing_info.date = 'Invalid date range';
  // }

  // data.maintenance_log.date.min = !isEmpty(data.maintenance_log.date.min) ? data.maintenance_log.date.min : '';
  // data.maintenance_log.date.max = !isEmpty(data.maintenance_log.date.max) ? data.maintenance_log.date.max : '';
  // data.registration_event.date.min = !isEmpty(data.registration_event.date.min) ? data.registration_event.date.min : '';
  // data.registration_event.date.max = !isEmpty(data.registration_event.date.max) ? data.registration_event.date.max : '';




  // if(!Validator.isEmpty(price.min) &&
  //    !Validator.isEmpty(price.max) &&
  //     price.min > price.max) {
  //   errors.purchasing_info.price = 'Invalid price range';
  // }
  //
  // if(!Validator.isEmpty(data.maintenance_log.date.min) &&
  //    !Validator.isEmpty(data.maintenance_log.date.max) &&
  //     data.maintenance_log.date.min > data.maintenance_log.date.max) {
  //   errors.maintenance_log.date = 'Invalid date range';
  // }
  //
  // if(!Validator.isEmpty(data.registration_event.date.min) &&
  //    !Validator.isEmpty(data.registration_event.date.max) &&
  //     data.registration_event.date.min > data.registration_event.date.max) {
  //   errors.registration_event.date = 'Invalid date range';
  // }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
