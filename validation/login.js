import Validator from 'validator';
import isEmpty from './is-empty';

export default data => {
  let errors = {};

  data.login = !isEmpty(data.login) ? data.login : '';
  data.password = !isEmpty(data.password) ? data.password : '';

  if(!Validator.isLength(data.login, { min: 2, max: 30 })) {
    errors.login = 'Username is invalid';
  }

  if(Validator.isEmpty(data.login)) {
    errors.login = 'Username field is required';
  }

  if(Validator.isEmpty(data.password)) {
    errors.password = 'Password field is required';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
