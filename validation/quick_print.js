import Validator from 'validator';
import isEmpty from './is-empty';

export default data => {
  let errors = {};

  // Coerce all empty fields submitted by user to type string
  data.printer = !isEmpty(data.printer) ? data.printer : '';
  data.formatID = !isEmpty(data.formatID) ? data.formatID : '';

  if(Validator.isEmpty(data.printer)) {
    errors.printer = 'Please select a printer.';
  }

  if(Validator.isEmpty(data.formatID)) {
    errors.formatID = 'Please select a format.';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
