import mongoose from 'mongoose';

const PrinterHubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  online: {
    type: Boolean,
    required: true
  },
  user: {
    type: String,
    required: true
  }
});

const PrinterHub = mongoose.model('printerHubs', PrinterHubSchema);

export default PrinterHub;
