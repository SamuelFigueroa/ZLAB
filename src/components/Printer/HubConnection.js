import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as signalR from '@aspnet/signalr';
import AddPrinterModal from './AddPrinterModal';

class HubConnection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      connection: new signalR.HubConnectionBuilder()
        .withUrl(this.props.address)
        .configureLogging(signalR.LogLevel.Trace)
        .build(),
      status: 'Connecting...',
      printers: [],
      modals: [],
    };

    this.openModal = this.openModal.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.registerPrinters = this.registerPrinters.bind(this);
    this.fetchPrinterJobs = this.fetchPrinterJobs.bind(this);
  }

  async componentDidMount() {
    if (this.state.connection !== null) {
      try {
        await this.state.connection.start();
        // Define all SignalR event handlers
        await this.state.connection.on('PrintersFound',
          async (printers) => await this.registerPrinters(printers));
        // await this.registerPrinters(['test_connection']);
        // Listen to messages from hub
        await this.state.connection.on('LogMessage',
          (printer, message) => {
            const printers = this.state.printers.map( p => {
              if(p.connection_name == printer)
                p.log = p.log.concat(message);
              return p;
            });
            this.setState({ printers });
          });
        await this.state.connection.on('QueueUpdated',
          async (connection_name) => await this.fetchPrinterJobs(connection_name));

        await this.state.connection.on('ShowPreview',
          async (connection_name, imageData) => {
            const printers = this.state.printers.map( p => {
              if(p.connection_name == connection_name)
                p.preview = imageData;
              return p;
            });
            this.setState({ printers });
          });

        await this.state.connection.onclose( () => this.setState({
          status: 'Disconnected', printers: [], modals: [], connection: null
        }));

        // Get USB connected printers
        await this.state.connection.invoke('GetPrinters');
        this.setState({ status: 'Online' });
      } catch (err) {
        this.setState({ status: 'Failed to establish a connection with this printer hub.' });
      }
    } else {
      this.setState({ status: 'This printer hub appears to be offline.' });
    }
  }

  async componentWillUnmount() {
    if (this.state.connection !== null)
      await this.state.connection.stop();
  }

  openModal = () => {
    if(this.state.modals.length) {
      const modalArr = [...this.state.modals];
      const nextModal = modalArr.shift();
      nextModal.open = true;
      modalArr.unshift(nextModal);
      this.setState({ modals: modalArr });
    }
  };

  handleModalClose = printer => async (event, reason) => {
    const modalArr = [...this.state.modals];
    const printerArr = [...this.state.printers];
    if (reason != 'escapeKeyDown' && reason != 'backdropClick') {
      let newPrinter = await this.props.actions.getPrinter(printer);
      const printerObj = Object.assign({}, {...newPrinter });
      printerObj.log = ['Printer found.'];
      printerObj.preview = '';
      printerArr.push(printerObj);
    }
    modalArr.shift();
    this.setState({ printers: printerArr, modals: modalArr }, this.openModal);
  }

  registerPrinters =
    async printers => {
      const printerArr = [];
      const modalArr = [];
      for (const printer of printers) {
        let knownPrinter = await this.props.actions.getPrinter(printer);
        if (!knownPrinter) {
          modalArr.push({
            open: false,
            connection_name: printer
          });
        } else {
          const printerObj = Object.assign({}, {...knownPrinter });
          printerObj.log = ['Printer found.'];
          printerObj.preview = '';
          printerArr.push(printerObj);
        }
      }
      this.setState({ printers: printerArr, modals: modalArr }, this.openModal);
    }

    fetchPrinterJobs = async connection_name => {
      let printer = await this.props.actions.getPrinter(connection_name);
      const { jobs, queue } = printer;
      const printers = this.state.printers.map( p => {
        if(p.connection_name == connection_name) {
          p.jobs = jobs;
          p.queue = queue;
        }
        return p;
      });
      this.setState({ printers });
    }

    render() {
      const { connection, printers, status, modals } = this.state;
      const { name } = this.props;
      return (
        <div>
          {
            modals.map( modal => (
              <AddPrinterModal
                key={modal.connection_name}
                open={modal.open}
                onClose={this.handleModalClose(modal.connection_name)}
                connection_name={modal.connection_name} />
            ))
          }
          {
            this.props.children({name, connection, printers, status})
          }
        </div>
      );
    }
}

HubConnection.propTypes = {
  address: PropTypes.string.isRequired,
  barcode: PropTypes.string,
  actions: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  children: PropTypes.func.isRequired
};

export default HubConnection;
