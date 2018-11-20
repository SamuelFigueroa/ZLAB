import Validator from 'validator';
import isEmpty from './is-empty';

export default data => {
  let errors = {};

  data.vendor = !isEmpty(data.vendor) ? data.vendor : '';
  data.catalog_id = !isEmpty(data.catalog_id) ? data.catalog_id : '';
  data.institution = !isEmpty(data.institution) ? data.institution : '';
  data.chemist = !isEmpty(data.chemist) ? data.chemist : '';
  data.solvent = !isEmpty(data.solvent) ? data.solvent : '';
  data.description = !isEmpty(data.description) ? data.description : '';
  data.owner = !isEmpty(data.owner) ? data.owner : '';
  data.location.area = !isEmpty(data.location.area) ? data.location.area : '';
  data.location.sub_area = !isEmpty(data.location.sub_area) ? data.location.sub_area : '';

  if(!Validator.isEmpty(data.vendor) && !Validator.isLength(data.vendor, { min: 2, max: 30 })) {
    errors.vendor = 'Vendor is invalid';
  }

  if(!Validator.isEmpty(data.institution) && !Validator.isLength(data.institution, { min: 2, max: 30 })) {
    errors.institution = 'Institution is invalid';
  }

  if(Validator.isEmpty(data.vendor) && Validator.isEmpty(data.institution)) {
    errors.vendor = 'Vendor is required';
    errors.institution = 'Institution is required';
  }

  if(!Validator.isEmpty(data.catalog_id) && !Validator.isLength(data.catalog_id, { min: 2, max: 30 })) {
    errors.catalog_id = 'Catalog number is invalid';
  }

  if(!Validator.isEmpty(data.chemist) && !Validator.isLength(data.chemist, { min: 2, max: 30 })) {
    errors.chemist = 'Chemist is invalid';
  }

  if(Validator.isEmpty(data.catalog_id) && Validator.isEmpty(data.chemist)) {
    errors.catalog_id = 'Catalog number is required';
    errors.chemist = 'Chemist is required';
  }

  if(!Validator.isLength(data.description, { max: 60 })) {
    errors.container_description = 'Description should be less than 60 characters';
  }

  if(data.state == 'S' && (isEmpty(data.mass) || isNaN(data.mass))) {
    errors.mass = 'Mass is required';
  }

  if(data.state != 'S') {
    if((isEmpty(data.volume) || isNaN(data.volume)))
      errors.volume = 'Volume is required';
    if(data.state == 'Soln') {
      if(Validator.isEmpty(data.solvent))
        errors.solvent = 'Solvent is required';
      if((isEmpty(data.concentration) || isNaN(data.concentration)))
        errors.concentration = 'Concentration is required';
    }
  }

  if(Validator.isEmpty(data.location.area)) {
    errors.location_area = 'Location field is required';
  }
  if(Validator.isEmpty(data.location.sub_area)) {
    errors.location_sub_area = 'Sub-location field is required';
  }
  if(Validator.isEmpty(data.owner)) {
    errors.owner = 'Owner is required';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
