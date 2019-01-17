import React from 'react';
import PropTypes from 'prop-types';

import ghs01 from '../../img/ghs01.png';
import ghs02 from '../../img/ghs02.png';
import ghs03 from '../../img/ghs03.png';
import ghs04 from '../../img/ghs04.png';
import ghs05 from '../../img/ghs05.png';
import ghs06 from '../../img/ghs06.png';
import ghs07 from '../../img/ghs07.png';
import ghs08 from '../../img/ghs08.png';
import ghs09 from '../../img/ghs09.png';

const pictograms = {
  'GHS01': { symbol: 'Exploding bomb', src: ghs01 },
  'GHS02': { symbol: 'Flame', src: ghs02 },
  'GHS03': { symbol: 'Flame over circle', src: ghs03 },
  'GHS04': { symbol: 'Gas cylinder', src: ghs04 },
  'GHS05': { symbol: 'Corrosion', src: ghs05 },
  'GHS06': { symbol: 'Skull and crossbones', src: ghs06 },
  'GHS07': { symbol: 'Exclamation mark', src: ghs07 },
  'GHS08': { symbol: 'Health hazard', src: ghs08 },
  'GHS09': { symbol: 'Environment', src: ghs09 }
};

const Pictogram = (props) => {
  const { code, ...rest } = props;
  return <img { ...rest} src={pictograms[code].src} alt={`GHS pictogram: ${pictograms[code].symbol}`} />;
}

Pictogram.propTypes = {
  code: PropTypes.string.isRequired
};

export default Pictogram;
