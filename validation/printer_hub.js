import Validator from 'validator';
import isEmpty from './is-empty';

export default data => {
  let errors = {};

  // Coerce all empty fields submitted by user to type string
  data.name = !isEmpty(data.name) ? data.name : '';
  data.address = !isEmpty(data.address) ? data.address : '';

  if(!Validator.isLength(data.name, { min: 2, max: 30 })){
    errors.name = 'Name must be between 2 and 30 characters';
  }

  if(Validator.isEmpty(data.name)) {
    errors.name = 'Name field is required';
  }

  if(Validator.isEmpty(data.address)) {
    errors.address = 'Address field is required';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
