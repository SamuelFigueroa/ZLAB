import Validator from 'validator';
import isEmpty from './is-empty';

export default data => {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';
  data.barcode = !isEmpty(data.barcode) ? data.barcode : '';
  data.location.area = !isEmpty(data.location.area) ? data.location.area : '';
  data.location.sub_area = !isEmpty(data.location.sub_area) ? data.location.sub_area : '';
  data.purchasing_info.date = !isEmpty(data.purchasing_info.date) ? data.purchasing_info.date : '';
  data.purchasing_info.supplier = !isEmpty(data.purchasing_info.supplier) ? data.purchasing_info.supplier : '';
  data.grant.grant_number = !isEmpty(data.grant.grant_number) ? data.grant.grant_number : '';
  data.grant.project_name = !isEmpty(data.grant.project_name) ? data.grant.project_name : '';
  data.grant.funding_agency = !isEmpty(data.grant.funding_agency) ? data.grant.funding_agency : '';

  if(!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = 'Name is invalid';
  }

  if(Validator.isEmpty(data.name)) {
    errors.name = 'Name is required';
  }

  if(!Validator.isLength(data.barcode, { min: 2, max: 30 })) {
    errors.barcode = 'Barcode is invalid';
  }

  if(Validator.isEmpty(data.barcode)) {
    errors.barcode = 'Barcode is required';
  }

  if(!Validator.isLength(data.description, { max: 60 })) {
    errors.description = 'Description should be less than 60 characters';
  }

  if(Validator.isEmpty(data.location.area)) {
    errors.location_area = 'Location field is required';
  }
  if(Validator.isEmpty(data.location.sub_area)) {
    errors.location_sub_area = 'Sub-location field is required';
  }

  if(!Validator.isLength(data.serial_number, { max: 30 })) {
    errors.serial_number = 'Serial number is invalid';
  }

  if(!Validator.isLength(data.model, { max: 30 })) {
    errors.model = 'Model is invalid';
  }

  if(!Validator.isLength(data.brand, { max: 30 })) {
    errors.brand = 'Brand is invalid';
  }

  if(Validator.isEmpty(data.purchasing_info.date)) {
    errors.purchasing_info_date = 'Purchase date is required';
  }

  if(!Validator.isLength(data.purchasing_info.supplier, { min: 2, max: 30 })) {
    errors.purchasing_info_supplier = 'Supplier is invalid';
  }

  if(Validator.isEmpty(data.purchasing_info.supplier)) {
    errors.purchasing_info_supplier = 'Supplier is required';
  }

  if(isNaN(data.purchasing_info.price)) {
    errors.purchasing_info_price = 'Purchase price is required';
  }

  if(!Validator.isLength(data.grant.grant_number, { min: 2, max: 30 })) {
    errors.grant_grant_number = 'Grant number is invalid';
  }

  if(Validator.isEmpty(data.grant.grant_number)) {
    errors.grant_grant_number = 'Grant number is required';
  }

  if(!Validator.isLength(data.grant.project_name, { min: 2, max: 30 })) {
    errors.grant_project_name = 'Project name is invalid';
  }

  if(Validator.isEmpty(data.grant.project_name)) {
    errors.grant_project_name = 'Project name is required';
  }

  if(!Validator.isLength(data.grant.funding_agency, { min: 2, max: 30 })) {
    errors.grant_funding_agency = 'Funding agency is invalid';
  }

  if(Validator.isEmpty(data.grant.funding_agency)) {
    errors.grant_funding_agency = 'Funding agency is required';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
