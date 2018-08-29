import Validator from 'validator';
import isEmpty from './is-empty';

export default data => {
  let errors = {};

  // Coerce all empty fields submitted by user to type string
  data.login = !isEmpty(data.login) ? data.login : '';
  data.name = !isEmpty(data.name) ? data.name : '';
  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';
  data.password2 = !isEmpty(data.password2) ? data.password2 : '';
  /*
  data.affiliation = !isEmpty(data.affiliation) ? data.affiliation : '';
  data.website = !isEmpty(data.website) ? data.website : '';
  data.location = !isEmpty(data.location) ? data.location : '';
  data.bio = !isEmpty(data.bio) ? data.bio : '';
  data.twitter = !isEmpty(data.twitter) ? data.twitter : '';
  data.linkedin = !isEmpty(data.linkedin) ? data.linkedin : '';
  data.googlescholar = !isEmpty(data.googlescholar) ? data.googlescholar : '';
  data.orcid = !isEmpty(data.orcid) ? data.orcid : '';
  */

  /* Username validations left to implement
    Username may only contain alphanumeric characters or hyphens.
    Username cannot have multiple consecutive hyphens.
    Username cannot begin or end with a hyphen.
    Some usernames will need to be reserved ( e.g. help, about, etc.)
*/

  if(!Validator.isLength(data.login, { min: 2, max: 30 })){
    errors.login = 'Username must be between 2 and 30 characters';
  }

  if(Validator.isEmpty(data.login)) {
    errors.login = 'Username field is required';
  }

  if(!Validator.isLength(data.name, { min: 2, max: 30 })){
    errors.name = 'Name must be between 2 and 30 characters';
  }

  if(Validator.isEmpty(data.name)) {
    errors.name = 'Name field is required';
  }

  if(!Validator.isEmail(data.email)) {
    errors.email = 'Email is invalid';
  }

  if(Validator.isEmpty(data.email)) {
    errors.email = 'Email field is required';
  }

  if(!Validator.isLength(data.password, { min: 7, max: 30 })) {
    errors.password = 'Password must be at least 7 characters';
  }

  if(Validator.isEmpty(data.password)) {
    errors.password = 'Password field is required';
  }

  if(!Validator.equals(data.password, data.password2)) {
    errors.password2 = 'Passwords must match';
  }

  if(Validator.isEmpty(data.password2)) {
    errors.password2 = 'Please re-enter the password';
  }
/*
  if(!Validator.isEmpty(data.affiliation)) {
    if(!Validator.isLength(data.affiliation, { max: 50 })) {
      errors.affiliation = 'Affiliation must be less than 50 characters';
    }
  }

  if(!Validator.isEmpty(data.website)) {
    if(!Validator.isURL(data.website)) {
      errors.website = 'Not a valid URL';
    }
  }

  if(!Validator.isEmpty(data.location)) {
    if(!Validator.isLength(data.location, { max: 30 })) {
      errors.location = 'Location must be less than 30 characters';
    }
  }

  if(!Validator.isEmpty(data.bio)) {
    if(!Validator.isLength(data.bio, { max: 160 })) {
      errors.bio = 'Bio must be less than 160 characters';
    }
  }

  if(!Validator.isEmpty(data.twitter)) {
    if(!Validator.isURL(data.twitter)) {
      errors.twitter = 'Not a valid URL';
    }
  }

  if(!Validator.isEmpty(data.linkedin)) {
    if(!Validator.isURL(data.linkedin)) {
      errors.linkedin = 'Not a valid URL';
    }
  }

  if(!Validator.isEmpty(data.googlescholar)) {
    if(!Validator.isURL(data.googlescholar)) {
      errors.googlescholar = 'Not a valid URL';
    }
  }

  if(!Validator.isEmpty(data.orcid)) {
    if(!Validator.isURL(data.orcid)) {
      errors.orcid = 'Not a valid URL';
    }
  }
*/
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
