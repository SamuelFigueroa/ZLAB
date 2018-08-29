import Validator from 'validator';
import isEmpty from './is-empty';

export default data => {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';

  if(!Validator.isLength(data.name, { max: 100 })) {
    errors.name = 'Filename exceeds 100 characters.';
  }

  if(Validator.isEmpty(data.name)) {
    errors.name = 'Filename is required.';
  }

  if(parseFloat(data.size) > 10000000) {
    errors.size = 'File size exceeds 10 MB.';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
