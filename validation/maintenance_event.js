import Validator from 'validator';
import isEmpty from './is-empty';

export default data => {
  let errors = {};

  data.date = !isEmpty(data.date) ? data.date : '';
  data.agent = !isEmpty(data.agent) ? data.agent : '';
  data.description = !isEmpty(data.description) ? data.description : '';
  data.scheduled = !isEmpty(data.scheduled) ? data.scheduled : '';

  if(Validator.isEmpty(data.date)) {
    errors.date = 'Date is required';
  }

  if(Validator.isEmpty(data.agent)) {
    errors.agent = 'Service agent is required';
  }

  if(!Validator.isLength(data.description, { max: 1000 })) {
    errors.description = 'Description should be less than 1000 characters';
  }

  if(Validator.isEmpty(data.description)) {
    errors.description = 'Description is required';
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
