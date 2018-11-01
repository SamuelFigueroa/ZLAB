import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import PreviewIcon from '@material-ui/icons/Visibility';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';

import TextFieldEdit from './TextFieldEdit';
import BarcodeFieldEdit from './BarcodeFieldEdit';
import GraphicFieldEdit from './GraphicFieldEdit';
import RfidFieldEdit from './RfidFieldEdit';
import DefaultsEdit from './DefaultsEdit';
import FieldList from './FieldList';
import AddFieldModal from './AddFieldModal';
import getZPLFormatter from './ZPLFormatter';
import UpdatePrinterFormat from '../mutations/UpdatePrinterFormat';
import AddPrinterFormat from '../mutations/AddPrinterFormat';

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
  },
  fieldList: {
    width: '100%',
    maxWidth: 360,
  },
  fieldEdit: {
    width: '100%',
    padding: theme.spacing.unit * 2
  },
  paper: {
    marginBottom: theme.spacing.unit * 8,
    // width: '198px',
    // height: '137px'
  },
  title: {
    paddingBottom: theme.spacing.unit * 3
  },
  preview: {
    padding: theme.spacing.unit * 3
  }
});

const isEmpty = value =>
  value === undefined ||
  value === null ||
  (typeof value === 'object' && Object.keys(value).length === 0) ||
  (typeof value === 'string' && value.trim().length === 0);

const createField = f => {
  let field = {
    ...f,
    data: f.variable ? f.name : '',  //^FD
  };
  if(f.kind == 'text') {
    field.fieldProps = {
      originX: 0,  //^FO
      originY: 0,  //^FO
      justify: 0,  //^FO
      reverse: false,  //^FR
      orientation: 'N',  //^A
      fontHeight: 10,  //^A
      fontWidth: 10,  //^A
      direction: 'H',  //^FP
      gap: 0,   //^FP
      clockEnabled: false,
      clock: '%',  //^FC
      hexEnabled: false,
      hexIndicator: '\\',  //^FC
    };
  }
  if(f.kind == 'barcode') {
    field.fieldProps = {
      originX: 0,  //^FO
      originY: 0,  //^FO
      justify: 0,  //^FO
      reverse: false,  //^FR
      moduleWidth : 1,  //^BY
      barWidthRatio: 2.0,  //^BY
      height: 10,  //^BY
      barcode: 'datamatrix',

      orientation: 'N',  //^B3  //^BX
      checkDigit: false,  //^B3
      interpretation: true,  //^B3
      interpretationAbove: false,  //^B3

      moduleHeight: 10,  //BX
      columns: 0,  //BX
      rows: 0, //BX
      aspectRatio: 1  //BX
    };
  }
  if(f.kind == 'rfid') {
    field.fieldProps = {
      operation: 'W',  //^RF
      format: 'A'  //^RF
    };
  }
  if(f.kind == 'graphic') {
    field.fieldProps = {
      originX: 0,  //^FO
      originY: 0,  //^FO
      justify: 0,  //^FO
      reverse: false,  //^FR
      graphic: 'box',
      width: 1,  //^GB  //^GD  //^GE
      height: 1,  //^GB  //^GD  //^GE
      thickness: 1,  //^GB  //^GC  //^GD  //^GE
      color: 'B',  //^GB  //^GC  //^GD  //^GE
      roundness: 0,  //^GB
      diameter: 3,  //^GC
      diagonalOrientation: 'R',  //^GD
      compression: 'A',  //^GF
      byteCount: 0, //^GF
      fieldCount: 0, //^GF
      bytesPerRow: 0, //^GF
      graphicData: '' //^GF
    };
  }

  return field;
};

class PrinterFormatEditor extends Component {
  constructor(props){
    super(props);
    this.state={
      fieldModalOpen: false,
      defaults: {
        name: '',
        labelWidth: 1,  //^PW
        labelLength: 1,  //^LL
        fieldOrientation: 'N',  //^FW
        fieldJustify: 0,  //^FW
        dotsPerMm: 'A', //^JM
        reverse: false,  //^LR
        mirror: false,  //^PM  ^PMN
        labelOrientation: 'N', //^PO
      },
      fields: [],
      current: {},
      printer: {}
      // connection: new signalR.HubConnectionBuilder()
      //   .withUrl(this.props.address)
      //   .build(),
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.saveField = this.saveField.bind(this);
    this.editField = this.editField.bind(this);
    this.cancelField = this.cancelField.bind(this);
    this.addField = this.addField.bind(this);
    this.deleteField = this.deleteField.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.previewFormat = this.previewFormat.bind(this);
    this.handlePrinterChange = this.handlePrinterChange.bind(this);
  }

  addField = field => {
    const errors = {};
    if(isEmpty(field.name)) {
      errors.name = 'Name is required.';
    }
    let nameExists = this.state.fields.some(f => f.name == field.name);
    if(nameExists) {
      errors.name = 'Name already exists.';
    }
    if(!isEmpty(errors))
      return errors;
    let fields = this.state.fields.slice();
    fields.push(createField(field));
    this.setState({ fields });
    return null;
  }

  editField = field => () => this.setState({ current: field });

  cancelField = () => this.setState({ current: {} });

  handleChange = (key, value) => {
    if(isEmpty(this.state.current))
      this.setState({ defaults: {...this.state.defaults, [key]: value } });
    else {
      if(typeof value == 'object') {
        if(key !== undefined)
          this.setState({ current: {...this.state.current,  [key]: { ...this.state.current[key], ...value } } });
        else {
          this.setState({ current: value });
        }
      }
      else {
        this.setState({ current: {...this.state.current, [key]: value } });
      }
    }
  }

  handlePrinterChange = printerName => {
    const printer = this.props.printers.find(p=>p.name == printerName);
    return this.setState({ printer });
  }

  saveField = () => {
    const { current } = this.state;
    let fields = this.state.fields.map(f => {
      if (f.name == current.name) {
        return current;
      }
      return f;
    });
    return this.setState({ fields, current: {} });
  }

  deleteField = fieldName => () => {
    let fields = [];
    this.state.fields.forEach(f => {
      let updatedField = {...f};
      if (f.name != fieldName) {
        if(f.variable && f.data == fieldName)
          updatedField.data = f.name;
        fields.push(updatedField);
      }
    });
    let state = { fields };
    if(!isEmpty(this.state.current)) {
      if(this.state.current.name == fieldName)
        state.current = {};
      else {
        if(this.state.current.variable && this.state.current.data == fieldName)
          state.current = {...this.state.current, data: this.state.current.name };
      }
    }
    this.setState(state);
  }

  handleModalClose = () => this.setState({ fieldModalOpen: false });

  openModal = () => this.setState({ fieldModalOpen: true });

  handleSubmit = callAction => e => {
    e.preventDefault();
    const { format } = this.props;
    const update = format ? true : false;
    const { fields: formatFields } = this.state;
    const { name, ...defaults } = this.state.defaults;
    const fields = formatFields.map(field => {
      const { fieldProps, ...rest } = field;
      return {...rest, ...fieldProps };
    });
    if(update) {
      const { id } = format;
      const input = { name, defaults, fields, id };
      return callAction(input);
    }
    const input = { name, defaults, fields };
    return callAction(input);
  }

  handleCancel = (clearErrors) => () => {
    clearErrors();
    return this.props.history.goBack();
  }

  previewFormat = async() => {
    const { connection_name } = this.state.printer;
    const { name, ...defaults } = this.state.defaults;
    let fields = this.state.fields.map(field => {
      const { fieldProps, ...f } = field;
      return ({ ...f, ...fieldProps });
    });
    const preview = true;
    const { format, vars } = getZPLFormatter(defaults, fields, preview);
    Object.keys(vars).forEach(key => vars[key] = 'TEST');
    await this.props.hubConnection.invoke('PreviewZpl', connection_name, format(vars));
  }

  componentDidMount() {
    const { format } = this.props;
    const update = format ? true : false;
    if(update) {
      const { name, defaults: d, fields: dataFields } = format;
      const fields = dataFields.map(field => {
        const { name, variable, kind, data, __typename, ...fieldProps } = field;
        return { name, variable, kind, data, fieldProps };
      });
      const { __typename, ...defaultFields } = d;
      const defaults = {...defaultFields, name};
      this.setState({ defaults, fields });
    }
  }

  render() {
    const { classes, format, printers } = this.props;
    const { current, printer } = this.state;
    const { preview } = printer;
    const update = format ? true : false;
    const Action = update ? UpdatePrinterFormat : AddPrinterFormat;

    const isCurrentDefault = isEmpty(current);
    const fieldEditComponents = {
      text: TextFieldEdit,
      barcode: BarcodeFieldEdit,
      graphic: GraphicFieldEdit,
      rfid: RfidFieldEdit
    };
    let EditComponent;
    let variables = [];
    if(!isCurrentDefault) {
      EditComponent = fieldEditComponents[current.kind];
      if(current.variable) {
        this.state.fields.forEach(field => {
          if(field.variable)
            variables.push(field.data);
        });
        variables = Array.from(new Set(variables));
      }
    }

    return (
      <Action>
        { (callAction, errors, clearErrors) => (
          <div className={classes.root}>
            <AddFieldModal
              open={this.state.fieldModalOpen}
              onClose={this.handleModalClose}
              addField={this.addField}
            />
            <Grid
              container
              justify="center"
              alignItems="center"
            >
              <Grid item xs={12}>
                <Typography align="center" variant="display1" gutterBottom className={classes.title}>
                      Format Editor
                </Typography>
              </Grid>
              <Grid item>
                <Paper square elevation={8} className={classes.paper}>
                  {
                    !isEmpty(printer) && printer.preview.length ?
                      <img src={`data:image/png;base64,${preview}`} alt="Label Preview" />
                      : <Typography color="textSecondary" className={classes.preview} variant="title" align="center">Label Preview</Typography>
                  }
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={8}>
                  <Grid item xs={4}>
                    <FieldList
                      current={current}
                      addField={this.openModal}
                      editField={this.editField}
                      deleteField={this.deleteField}
                      fields={this.state.fields}
                    />
                  </Grid>
                  <Grid item xs={8}>
                    <Paper className={classes.fieldEdit}>
                      <div style={{ position: 'absolute', right: 0 }}>
                        <Tooltip title="Preview Label" placement="top">
                          <span style={{ position: 'relative', bottom: '32px', right: '32px' }}>
                            <Button
                              disabled={isEmpty(printer)}
                              variant="fab"
                              color="primary"
                              aria-label="Preview"
                              onClick={this.previewFormat}
                            >
                              <PreviewIcon />
                            </Button>
                          </span>
                        </Tooltip>
                      </div>
                      {
                        isCurrentDefault ? (
                          <DefaultsEdit
                            defaults={this.state.defaults}
                            onChange={this.handleChange}
                            saveFormat={this.handleSubmit(callAction)}
                            errors={errors}
                            cancelFormat={this.handleCancel(clearErrors)}
                            onPrinterChange={this.handlePrinterChange}
                            previewPrinter={printer}
                            previewOptions={printers}
                          />
                        ) : (
                          <EditComponent
                            onChange={this.handleChange}
                            saveField={this.saveField}
                            cancelField={this.cancelField}
                            variables={variables.map(v => ({label: v, value: v}))}
                            componentProps={current}
                            defaults={this.state.defaults}
                          />
                        )
                      }
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
        )}
      </Action>
    );
  }
}

PrinterFormatEditor.propTypes = {
  classes: PropTypes.object.isRequired,
  format: PropTypes.object,
  history: PropTypes.object.isRequired,
  printers: PropTypes.array.isRequired,
  hubConnection: PropTypes.object.isRequired
};

export default withStyles(styles)(withRouter(PrinterFormatEditor));
