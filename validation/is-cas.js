const isCas = value => {
  if (typeof value === 'string' && value.trim().length < 13) {
    const test = value.trim();
    const cas_regex = /(\d{2,7})-(\d{2})-(\d)/;
    const found = test.match(cas_regex);
    if (found && found[0].length == test.length) {
      let sum = 0;
      let digits = found[1].concat(found[2]);
      let index = digits.length;
      for(let n of digits) {
        sum = sum + index * n;
        index--;
      }
      if (sum % 10 == parseInt(found[3]))
        return true;
    }
  }
  return false;
};

export default isCas;
