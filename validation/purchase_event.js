import Validator from 'validator';
import isEmpty from './is-empty';

export default data => {
  let errors = {};

  data.date = !isEmpty(data.date) ? data.date : '';
  data.supplier = !isEmpty(data.supplier) ? data.supplier : '';
  data.catalog_number = !isEmpty(data.catalog_number) ? data.catalog_number : '';
  data.received = !isEmpty(data.received) ? data.received : '';
  data.price = !isEmpty(data.price) ? data.price : NaN;
  data.quantity = !isEmpty(data.quantity) ? data.quantity : NaN;

  if(Validator.isEmpty(data.date)) {
    errors.date = 'Date is required';
  }

  if(!Validator.isLength(data.supplier, { min: 2, max: 30 })) {
    errors.supplier = 'Supplier should be between 2 and 30 characters';
  }

  if(Validator.isEmpty(data.supplier)) {
    errors.supplier = 'Supplier is required';
  }

  if(!Validator.isLength(data.catalog_number, { min: 2, max: 30 })) {
    errors.catalog_number = 'Catalog number should be between 2 and 30 characters';
  }

  if(Validator.isEmpty(data.catalog_number)) {
    errors.catalog_number = 'Catalog number is required';
  }

  if(isNaN(data.quantity)) {
    errors.quantity = 'Quantity is required';
  }

  if(data.quantity == 0) {
    errors.quantity = 'Quantity should be greater than 0';
  }

  if(isNaN(data.price)) {
    errors.price = 'Price is required';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
