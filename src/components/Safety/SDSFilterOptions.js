import React from 'react';
import PropTypes from 'prop-types';
import GetSafetyDataSheetHints from '../queries/GetSafetyDataSheetHints';

const class_regex = /\(chapter \d+.\d+\)/;
const pictograms = {
  'GHS01':'Exploding bomb',
  'GHS02':'Flame',
  'GHS03':'Flame over circle',
  'GHS04':'Gas cylinder',
  'GHS05':'Corrosion',
  'GHS06':'Skull and crossbones',
  'GHS07':'Exclamation mark',
  'GHS08':'Health hazard',
  'GHS09':'Environment'
};
const SDSFilterOptions = (props) => (
  <GetSafetyDataSheetHints>
    { sdsHints => {
      let options = {
        'manufacturer': sdsHints.manufacturer.map(m => ({ label: m, value: m })),
        'signal_word': sdsHints.signal_word.map(word => ({ label: word, value: word })),
        'pictograms': sdsHints.pictograms.map(p => ({ label: pictograms[p.toUpperCase()], value: p })),
        'h_class': sdsHints.h_class.map(h => ({ label: h.replace(class_regex, '').trim(), value: h }))
      };
      return props.children(options);
    }}
  </GetSafetyDataSheetHints>
);

SDSFilterOptions.propTypes = {
  children: PropTypes.func.isRequired,
};

export default SDSFilterOptions;
