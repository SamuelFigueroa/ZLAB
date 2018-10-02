import React, { Component } from 'react';
import PropTypes from 'prop-types';
//import { withStyles } from '@material-ui/core/styles';

import GetPrinterHubs from './queries/GetPrinterHubs';
import GetPrinter from './queries/GetPrinter';
import PrinterHub from './PrinterHub';

class Printers extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <GetPrinter>
        {
          getPrinter => (
            <GetPrinterHubs>
              { hubs => hubs.map( hub =>
                <PrinterHub
                  key={hub.id}
                  actions={{
                    getPrinter
                  }}
                  name={hub.name}
                  address={hub.address}
                  barcode={this.props.barcode}/>
              )}
            </GetPrinterHubs>
          )}
      </GetPrinter>
    );
  }
}

Printers.propTypes = {
  barcode: PropTypes.string
};

export default Printers;
