import Validator from 'validator';
import isEmpty from './is-empty';

export default data => {
  let errors = {};

  // Coerce all empty fields submitted by user to type string
  data.data = !isEmpty(data.data) ? data.data : '';

  if(!Validator.isLength(data.data, { min: 2 })){
    errors.barcode = 'Barcode must be between 2 and 30 characters.';
  }

  if(Validator.isEmpty(data.data)) {
    errors.barcode = 'Barcode field cannot be empty.';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
