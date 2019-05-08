const nestedAssign = (target, property, value) => {
  let propertyArr = property.split('.');
  if (propertyArr.length == 1)
    return target[property] = value;
  else {
    let firstElem = propertyArr.shift();
    if (!(firstElem in target))
      target[firstElem] = {};
    return nestedAssign(target[firstElem], propertyArr.join('.'), value);
  }
};

const getFilterObject = (filterGroups, cacheFilter) => {
  let input = {};
  filterGroups.forEach( group => {
    group.filters.forEach( filter => {
      const { key, type, path } = filter;
      switch (type) {
      case 'Multi': {
        if (cacheFilter[key].length)
          nestedAssign(input, path, cacheFilter[key].map( option => option[0] ));
        break;
      }
      case 'Single': {
        if (cacheFilter[key].length)
          nestedAssign(input, path, cacheFilter[key][0][0]);
        break;
      }
      case 'DateRange': {
        const min = cacheFilter[key][0];
        const max = cacheFilter[key][1];
        min && nestedAssign(input, `${path}.min`, min);
        max && nestedAssign(input, `${path}.max`, max);
        break;
      }
      case 'MeasurementRange': {
        const min = cacheFilter[key][0];
        const max =cacheFilter[key][2];
        if(!(isNaN(parseFloat(min.replace(/,/g, ''))))) {
          nestedAssign(input, `${path}.min`, parseFloat(min.replace(/,/g, '')));
          nestedAssign(input, `${filter.units}.min`, cacheFilter[key][1]);
        }
        if(!(isNaN(parseFloat(max.replace(/,/g, ''))))) {
          nestedAssign(input, `${path}.max`, parseFloat(max.replace(/,/g, '')));
          nestedAssign(input, `${filter.units}.max`, cacheFilter[key][3]);
        }
        break;
      }
      case 'CurrencyRange': {
        const min = parseFloat(cacheFilter[key][0]);
        const max = parseFloat(cacheFilter[key][1]);
        !(isNaN(min) || (min === null)) && nestedAssign(input, `${path}.min`, min);
        !(isNaN(max) || (max === null)) && nestedAssign(input, `${path}.max`, max);
        break;
      }

      default:
        break;
      }
    });
  });
  return input;
};

export const getFilter=getFilterObject;
