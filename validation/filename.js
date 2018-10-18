import validFilename from 'valid-filename';
import isEmpty from './is-empty';

export default data => {
  let errors = {};

  if(!validFilename(data.name)) {
    errors.name = 'Invalid filename';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
