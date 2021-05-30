import isEmpty from './is-empty';


export default data => {
  let errors = {};

  if(isEmpty(data.after))
    data.after = undefined;
  if(isEmpty(data.before))
    data.before = undefined;
  if(isEmpty(data.first))
    data.first = undefined;
  if(isEmpty(data.last))
    data.last = undefined;

  if (!isEmpty(data.first)) {
    if (data.first < 0)
      errors.first = 'First must be a non-negative integer';
    if (!isEmpty(data.last) || !isEmpty(data.before))
      errors.first = 'First can only be combined with after';
  } else {
    if (!isEmpty(data.last)) {
      if (data.last < 0)
        errors.last = 'Last must be a non-negative integer';
      if (!isEmpty(data.after))
        errors.last = 'Last can only be combined with before';
    }
    else {
      if (!isEmpty(data.after))
        errors.first = 'First is required if after is set';
      if (!isEmpty(data.before))
        errors.last = 'Last is required if before is set';
    }
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
