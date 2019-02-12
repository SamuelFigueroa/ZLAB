import Validator from 'validator';
import isEmpty from './is-empty';

export default data => {
  let errors = {};

  data.area = !isEmpty(data.area) ? data.area : '';
  data.sub_area = !isEmpty(data.sub_area) ? data.sub_area : '';

  if(!Validator.isLength(data.area, { min: 2, max: 30 })) {
    errors.area = 'Area is invalid';
  }

  if(Validator.isEmpty(data.area)) {
    errors.area = 'Area field is required';
  }

  if(data.area === 'UNASSIGNED') {
    errors.area = 'UNASSIGNED area name is reserved';
  }

  if(!Validator.isLength(data.sub_area, { min: 2, max: 30 })) {
    errors.sub_area = 'Sub-area is invalid';
  }

  if(Validator.isEmpty(data.sub_area)) {
    errors.sub_area = 'Sub-area field is required';
  }

  if(data.sub_area === 'UNASSIGNED') {
    errors.sub_area = 'UNASSIGNED sub-area name is reserved';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
