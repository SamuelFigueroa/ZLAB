
const getZPLFormatter = (defaults, fields, preview) =>  {

  const {
    labelWidth,  //^PW
    labelLength,  //^LL
    fieldOrientation, fieldJustify,  //^FW
    dotsPerMm,  //^JM
    reverse,  //^LRY ^LRN
    mirror,  //^PMY ^PMN
    labelOrientation  //^PO
  } = defaults;

  const getGraphicZPL = field => {
    const {
      originX, originY, justify,//^FO
      reverse,  //^FR
      graphic,
      width,  //^GB  //^GD  //^GE
      height,  //^GB  //^GD  //^GE
      thickness,  //^GB  //^GC  //^GD  //^GE
      color,  //^GB  //^GC  //^GD  //^GE
      roundness,  //^GB
      diameter,  //^GC
      diagonalOrientation,  //^GD
    } = field;
    return `
    ^FO${originX},${originY},${justify}
    ${reverse ? '^FR' : ''}
    ${graphic == 'box' ? `^GB${width},${height},${thickness},${color},${roundness}`:
    (graphic == 'circle' ? `^GC${diameter},${thickness},${color}` :
      (graphic == 'diagonal' ? `^GD${width},${height},${thickness},${color},${diagonalOrientation}` :
        (graphic == 'ellipse' ? `^GE${width},${height},${thickness},${color}` : '')))}
    ^FS`;
  };

  const getTextZPL = (field, index) => {
    const {
      originX, originY, justify,//^FO
      reverse,  //^FR
      orientation, fontHeight, fontWidth, //^A
      direction, gap, //^FP
      clockEnabled,
      clock,  //^FC
      hexEnabled,
      hexIndicator,  //^FH
      variable,
      data
    } = field;
    return `
    ^FO${originX},${originY},${justify}
    ^FP${direction},${gap}
    ${reverse ? '^FR' : ''}
    ^A0${orientation},${fontHeight},${fontWidth}
    ${clockEnabled ? `^FC${clock}` : ''}
    ${hexEnabled ? `^FC${hexIndicator}` : ''}
    ${variable ? `^FN${index}` : `^FD${data}`}
    ^FS
    `;
  };

  const getBarcodeZPL = (field, index) => {
    const {
      originX, originY, justify, //^FO
      reverse,  //^FR
      moduleWidth,  //^BY
      barWidthRatio,  //^BY
      height,  //^BY
      barcode,

      orientation,  //^B3  //^BX
      checkDigit,  //^B3
      interpretation,  //^B3
      interpretationAbove,  //^B3

      moduleHeight,  //BX
      columns,  //BX
      rows, //BX
      aspectRatio,  //BX
      variable,
      data
    } = field;

    return `
    ^FO${originX},${originY},${justify}
    ${reverse ? '^FR' : ''}
    ^BY${moduleWidth},${barWidthRatio},${height}
    ${barcode == 'code39' ? `^B3${orientation},${checkDigit},,${interpretation ? 'Y' : 'N'}, ${interpretationAbove ? 'Y' : 'N'}` :
    (barcode == 'datamatrix' ? `^BX${orientation},${moduleHeight},200,${columns},${rows},,,${aspectRatio}` : '')}
    ${variable ? `^FN${index}` : `^FD${data}`}
    ^FS
    `;
  };

  const getRfidZPL = (field, index) => {
    const {
      operation,  //^RF
      format,  //^RF
      variable,
      data
    } = field;
    if (operation == 'W' && variable) {
      return `
      ^RF${operation},${format}
      ^FN${index}
      ^FS
      `;
    }
    if (operation == 'W' && !variable) {
      return `
      ^RF${operation},${format}
      ^FD${data}
      ^FS
      `;
    }
    return `
    ^FN${index}
    ^RF${operation},${format}
    ^FS
    `;
  };

  const translators = {
    text: getTextZPL,
    barcode: getBarcodeZPL,
    rfid: getRfidZPL,
    graphic: getGraphicZPL
  };

  const getVariables = fields => {
    let nonRfidVariables = [];
    let rfidWriteVariables = [];
    let rfidReadVariables = [];

    fields.forEach(field => {
      const { data, variable, kind } = field;
      if(variable) {
        if(kind == 'rfid') {
          if(field.operation == 'W')
            rfidWriteVariables.push(data);
          else {
            rfidReadVariables.push(data);
          }
        } else {
          nonRfidVariables.push(data);
        }
      }
    });
    return { rfidWriteVariables, rfidReadVariables, nonRfidVariables };
  };

  let fieldZPL = '';
  const variables = getVariables(fields);
  const { rfidWriteVariables, rfidReadVariables, nonRfidVariables } = variables;
  const variableArray = preview ? Array.from(new Set(nonRfidVariables)) :
    Array.from(new Set(rfidWriteVariables.concat(rfidReadVariables, nonRfidVariables)));
  let rfidReadZPL = {};
  fields.forEach(field => {
    const { data, kind } = field;
    let zpl = '';
    if (kind == 'rfid') {
      if(!preview) {
        if (field.operation == 'W')
          zpl = translators[kind](field, variableArray.indexOf(data));
        else {
          rfidReadZPL[data] = translators[kind](field, variableArray.indexOf(data));
        }
      }
    } else {
      if (kind == 'graphic')
        zpl = translators[kind](field);
      else {
        zpl = translators[kind](field, variableArray.indexOf(data));
      }
    }
    fieldZPL = fieldZPL + zpl;
  });
  let vars = {};
  variableArray.forEach(variable => {
    if(rfidReadVariables.indexOf(variable) == -1)
      vars[variable] = '';
  });

  const format = data => {
    let isValidData = true;
    Object.keys(data).forEach(key => {
      let keyIncluded = variableArray.indexOf(key) != -1;
      // if( !keyIncluded || data[key] == '')
      if(!keyIncluded)
        isValidData = false;
    });
    if (!isValidData)
      return '';
    let variableZPL = '';

    variableArray.forEach((variable, index) => {
      if(rfidWriteVariables.indexOf(variable) != -1) {
        // if(!preview)
        variableZPL = variableZPL + `^FN${index}^FD${data[variable]}^FS`;
        // else {
        //   variableZPL = variableZPL + `^FN${index}^FDTEST^FS`;
        // }
      } else {
        if(rfidReadVariables.indexOf(variable) != -1) {
          if(!preview)
            variableZPL = variableZPL + rfidReadZPL[variable];
          else {
            variableZPL = variableZPL + `^FN${index}^FDTEST^FS`;
          }
        } else {
          if(nonRfidVariables.indexOf(variable) != -1)
            variableZPL = variableZPL + `^FN${index}^FD${data[variable]}^FS`;
        }
      }
    });

    // if(!preview) {
    //   rfidWriteVariables.forEach((variable, index) => {
    //     variableZPL = variableZPL + `^FN${index}^FD${data[variable]}^FS`;
    //   });
    //   rfidReadVariables.forEach(variable => {
    //     variableZPL = variableZPL + rfidReadZPL[variable];
    //   });
    // }
    // nonRfidVariables.forEach(variable => {
    //   variableZPL = variableZPL + `^FN${variableArray.indexOf(variable)}^FD${data[variable]}^FS`;
    // });
    let zpl =`
    ^XA
    ^PW${Math.round(labelWidth * 203.2)}
    ^LL${Math.round(labelLength * 203.2)}
    ^FW${fieldOrientation},${fieldJustify}
    ^JM${dotsPerMm}
    ${reverse ? '^LRY' : ''}
    ${mirror ? '^PMY' : ''}
    ^PO${labelOrientation}
    ${fieldZPL}
    ${variableZPL}
    ${reverse ? '^LRN' : ''}
    ${mirror ? '^PMN' : ''}
    ^XZ
    `;
    return zpl.replace(/(\s+)?(?:(\^FD[^^]+\^FS))?/g, (match, p1, p2) =>  [p2].join(''));
  };

  return {vars, format};
};

export default getZPLFormatter;
