import Validator from 'validator';
import isEmpty from './is-empty';

export default (data) => {
  let errors = {};
  const states = new Set(['L', 'S', 'Soln', 'G', 'Susp']);
  const mass_units = new Set(['kg', 'g', 'mg', 'ug']);
  const vol_units = new Set(['L', 'mL', 'uL', 'nL']);
  const conc_units = new Set(['M', 'mM', 'uM', 'nM']);

  data.barcode = !isEmpty(data.barcode) ? data.barcode.trim() : '';
  data.vendor = !isEmpty(data.vendor) ? data.vendor.trim() : '';
  data.catalog_id = !isEmpty(data.catalog_id) ? data.catalog_id.trim() : '';
  data.institution = !isEmpty(data.institution) ? data.institution.trim() : '';
  data.researcher = !isEmpty(data.researcher) ? data.researcher.trim() : '';
  data.eln_id = !isEmpty(data.eln_id) ? data.eln_id.trim() : '';
  data.solvent = !isEmpty(data.solvent) ? data.solvent.trim() : '';
  data.description = !isEmpty(data.description) ? data.description.trim() : '';
  data.owner = !isEmpty(data.owner) ? data.owner : '';
  data.location.area = !isEmpty(data.location.area) ? data.location.area : '';
  data.location.sub_area = !isEmpty(data.location.sub_area) ? data.location.sub_area : '';

  data.mass_units = (!isEmpty(data.mass_units) && mass_units.has(data.mass_units))? data.mass_units : null;
  data.vol_units = (!isEmpty(data.vol_units) && vol_units.has(data.vol_units)) ? data.vol_units : null;
  data.conc_units = (!isEmpty(data.conc_units) && conc_units.has(data.conc_units)) ? data.conc_units : null;

  if(data.category != 'Sample' && data.category != 'Reagent')
    errors.category = 'Category must be either Sample or Reagent';

  if(!states.has(data.state))
    errors.state = `State must be one of ${Array.from(states)}`;

  if(data.category == 'Sample') {
    if(!Validator.isLength(data.barcode, { min: 2, max: 30 })) {
      errors.barcode = 'Barcode is invalid';
    }

    if(Validator.isEmpty(data.barcode)) {
      errors.barcode = 'Barcode is required';
    }

    if(!Validator.isEmpty(data.researcher) && Validator.isEmpty(data.eln_id)) {
      errors.eln_id = 'ELN ID is required';
    }
  }

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

  if(!Validator.isEmpty(data.researcher) && !Validator.isLength(data.researcher, { min: 2, max: 30 })) {
    errors.researcher = 'Researcher is invalid';
  }

  if(Validator.isEmpty(data.catalog_id) && Validator.isEmpty(data.researcher)) {
    errors.catalog_id = 'Catalog number is required';
    errors.researcher = 'Researcher is required';
  }

  if(!Validator.isLength(data.description, { max: 60 })) {
    errors.container_description = 'Description should be less than 60 characters';
  }

  if(data.state == 'S') {
    if(isEmpty(data.mass) || isNaN(data.mass))
      errors.mass = 'Mass is required';
    if(data.mass_units === null)
      errors.mass_units = `Mass units must be one of ${Array.from(mass_units)}`;
  }

  if(data.state != 'S') {
    if((isEmpty(data.volume) || isNaN(data.volume)))
      errors.volume = 'Volume is required';
    if(data.vol_units === null)
      errors.vol_units = `Volume units must be one of ${Array.from(vol_units)}`;
    if(data.state == 'Soln') {
      if(Validator.isEmpty(data.solvent))
        errors.solvent = 'Solvent is required';
    }
    if(data.state == 'Soln'|| data.state == 'Susp') {
      if((isEmpty(data.concentration) || isNaN(data.concentration)))
        errors.concentration = 'Concentration is required';
      if(data.conc_units === null)
        errors.conc_units = `Concentration units must be one of ${Array.from(conc_units)}`;
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
