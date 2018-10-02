import Validator from 'validator';
import isEmpty from './is-empty';

export default data => {
  let errors = {};

  // Coerce all empty fields submitted by user to type string
  data.name = !isEmpty(data.name) ? data.name : '';
  data.connection_name = !isEmpty(data.connection_name) ? data.connection_name : '';

  if(!Validator.isLength(data.name, { min: 2, max: 30 })){
    errors.name = 'Name must be between 2 and 30 characters';
  }

  if(Validator.isEmpty(data.name)) {
    errors.name = 'Name field is required';
  }

  if(Validator.isEmpty(data.connection_name)) {
    errors.connection_name = 'Connection name field is required';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
