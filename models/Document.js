import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['SOP', 'Safety', 'Invoice', 'Maintenance'],
    required: true
  },
  size: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  encoding: {
    type: String,
    required: true
  },
  upload_event: {
    user: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      'default': Date.now
    }
  }
});

const Document = mongoose.model('documents', DocumentSchema);

export default Document;
