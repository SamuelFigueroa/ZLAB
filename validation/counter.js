import Validator from 'validator';
import isEmpty from './is-empty';

export default data => {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';
  data.prefix = !isEmpty(data.prefix) ? data.prefix : '';
  data.numDigits = !isEmpty(data.numDigits) ? data.numDigits : 6;

  if(!Validator.isLength(data.name, { min: 2, max: 20 })) {
    errors.name = 'Name must be between 2 and 20 characters';
  }

  if(Validator.isEmpty(data.name)) {
    errors.name = 'Name field is required';
  }

  if(!Validator.isLength(data.prefix, { min: 1, max: 3 })) {
    errors.prefix = 'Prefix must be between 1 and 3 characters';
  }

  if(Validator.isEmpty(data.prefix)) {
    errors.prefix = 'Prefix field is required';
  }

  if(isNaN(data.numDigits) || data.numDigits > 12 || data.numDigits < 2) {
    errors.numDigits = 'Number of digits must be between an integer between 2 and 12';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
