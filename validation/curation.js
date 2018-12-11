import Validator from 'validator';
import isEmpty from './is-empty';


export default data => {
  let errors = {};

  data.reason = !isEmpty(data.reason) ? data.reason : '';
  data.smiles = !isEmpty(data.smiles) ? data.smiles : '';

  if(Validator.isEmpty(data.smiles)) {
    errors.molblock = 'A chemical structure is required.';
  }

  if(Validator.isEmpty(data.reason)) {
    errors.reason = 'A reason must be provided.';
  }

  if(!Validator.isLength(data.reason, { max: 1000 })) {
    errors.reason = 'Reason should be less than 1000 characters';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
