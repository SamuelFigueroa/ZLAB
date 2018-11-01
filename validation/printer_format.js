import Validator from 'validator';
import isEmpty from './is-empty';

export default data => {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';

  if(!Validator.isLength(data.name, { min: 1, max: 30 })) {
    errors.name = 'Name should be between 1 and 30 characters';
  }

  if(Validator.isEmpty(data.name)) {
    errors.name = 'Name is required';
  }

  if(!data.defaults.labelLength) {
    errors.labelLength = 'Length should not be zero';
  }

  if(!data.defaults.labelWidth) {
    errors.labelWidth = 'Width should not be zero';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
