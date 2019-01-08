import Validator from 'validator';
import isEmpty from './is-empty';


export default data => {
  let errors = {};

  if (data.kind == 'mass') {
    data.source = !isEmpty(data.source) ? data.source : '';
    data.destination = !isEmpty(data.destination) ? data.destination : '';

    if(data.source == data.destination) {
      errors.destination = 'Source and destination containers cannot be the same';
    }

    if(Validator.isEmpty(data.source)) {
      errors.source = 'Barcode is required';
    }

    if(Validator.isEmpty(data.destination)) {
      errors.destination = 'Barcode is required';
    }

    if(!isEmpty(data.src_init_mg) && !isNaN(data.src_init_mg) && data.src_init_mg <= 0)
      errors.src_init_mg = 'Invalid mass';

    if(isEmpty(data.src_init_mg) || isNaN(data.src_init_mg))
      errors.src_init_mg = 'Mass is required';

    if(!isEmpty(data.src_fin_mg) && !isNaN(data.src_fin_mg) && data.src_fin_mg <= 0)
      errors.src_fin_mg = 'Invalid mass';

    if(isEmpty(data.src_fin_mg) || isNaN(data.src_fin_mg))
      errors.src_fin_mg = 'Mass is required';

    if(!isEmpty(data.dst_init_mg) && !isNaN(data.dst_init_mg) && data.dst_init_mg <= 0)
      errors.dst_init_mg = 'Invalid mass';

    if(isEmpty(data.dst_init_mg) || isNaN(data.dst_init_mg))
      errors.dst_init_mg = 'Mass is required';

    if(!isEmpty(data.dst_fin_mg) && !isNaN(data.dst_fin_mg) && data.dst_fin_mg <= 0)
      errors.dst_fin_mg = 'Invalid mass';

    if(isEmpty(data.dst_fin_mg) || isNaN(data.dst_fin_mg))
      errors.dst_fin_mg = 'Mass is required';

    if(Object.keys(errors).length == 0) {
      if(!(data.src_fin_mg < data.src_init_mg)) {
        errors.src_init_mg = 'Invalid mass';
        errors.src_fin_mg = 'Invalid mass';
      }
      if(!(data.dst_init_mg < data.dst_fin_mg)) {
        errors.dst_init_mg = 'Invalid mass';
        errors.dst_fin_mg = 'Invalid mass';
      }
    }
  }

  if (data.kind == 'volume') {
    data.source = !isEmpty(data.source) ? data.source : '';
    data.destination = !isEmpty(data.destination) ? data.destination : '';

    if(Validator.isEmpty(data.source))
      errors.source = 'Barcode is required';

    if(Validator.isEmpty(data.source))
      errors.destination = 'Barcode is required';

    if(!isEmpty(data.volume) && !isNaN(data.volume) && data.volume <= 0)
      errors.volume = 'Invalid transfer volume';

    if(isEmpty(data.volume) || isNaN(data.volume))
      errors.volume = 'Transfer volume is required';

  }

  if (data.kind == 'drying') {
    data.container = !isEmpty(data.container) ? data.container : '';
    if(Validator.isEmpty(data.container))
      errors.container = 'Barcode is required';
  }

  if (data.kind == 'resuspension') {
    data.container = !isEmpty(data.container) ? data.container : '';
    data.solvent = !isEmpty(data.solvent) ? data.solvent : '';

    if(Validator.isEmpty(data.container))
      errors.container = 'Barcode is required';

    if(Validator.isEmpty(data.solvent))
      errors.solvent = 'Solvent is required';

    if(!isEmpty(data.concentration) && !isNaN(data.concentration) && data.concentration <= 0)
      errors.concentration = 'Invalid concentration';

    if(isEmpty(data.concentration) || isNaN(data.concentration))
      errors.concentration = 'Concentration is required';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
