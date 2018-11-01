import Validator from 'validator';
import isEmpty from './is-empty';

export default data => {
  let errors = {};

  // Coerce all empty fields submitted by user to type string
  data.data = !isEmpty(data.data) ? data.data : '';

  if(Validator.isEmpty(data.data)) {
    errors.add = 'ZPL format output cannot be empty.';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
