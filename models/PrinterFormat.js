import mongoose from 'mongoose';

const PrinterFormatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  formatZpl: {
    type: String,
    required: true
  },
  previewZpl: {
    type: String,
    required: true
  },
  fields: [{
    data: {
      type: String,
      required: true
    },
    'index': {
      type: Number,
      required: true
    }
  }]
});

const PrinterFormat = mongoose.model('printerFormats', PrinterFormatSchema);

export default PrinterFormat;
