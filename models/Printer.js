import mongoose from 'mongoose';

const PrinterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  connection_name: {
    type: String,
    required: true
  },
  queue: {
    type: Boolean,
    'default': false
  },
  jobs: [{
    name: {
      type: String,
      required: true
    },
    data: {
      type: String,
      required: true
    },
    time_added: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Queued', 'InProgress'],
      required: true
    }
  }]
});

const Printer = mongoose.model('printers', PrinterSchema);

export default Printer;
