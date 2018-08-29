import mongoose from 'mongoose';

const SourceSchema = new mongoose.Schema({
  abbreviation: String,
  name: {
    type: String,
    required: true
  },
  website: String,
  source_type: {
    type: String,
    enum: ['Vendor', 'Institution'],
    required: true
  }
});

const Source = mongoose.model('sources', SourceSchema);

export default Source;
