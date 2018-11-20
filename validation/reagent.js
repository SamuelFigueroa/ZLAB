import Validator from 'validator';
import isEmpty from './is-empty';
import isCas from './is-cas';


export default data => {
  let errors = {};

  data.smiles = !isEmpty(data.smiles) ? data.smiles : '';
  data.name = !isEmpty(data.name) ? data.name : '';
  data.cas = !isEmpty(data.cas) ? data.cas : '';
  data.description = !isEmpty(data.description) ? data.description : '';
  data.storage = !isEmpty(data.storage) ? data.storage : '';

  if(!Validator.isLength(data.name, { min: 2 })) {
    errors.name = 'Name is invalid';
  }

  if(Validator.isEmpty(data.name)) {
    errors.name = 'Name is required';
  }

  if(!Validator.isEmpty(data.cas) && !isCas(data.cas)) {
    errors.cas = 'CAS number is invalid';
  }

  if(!Validator.isLength(data.description, { max: 60 })) {
    errors.description = 'Description should be less than 60 characters';
  }

  if(Validator.isEmpty(data.description) && Validator.isEmpty(data.smiles)) {
    errors.description = 'A description is required if a chemical structure was not entered';
  }

  if(!Validator.isLength(data.storage, { max: 60 })) {
    errors.storage = 'Storage should be less than 60 characters';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
