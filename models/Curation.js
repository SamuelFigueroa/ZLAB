import mongoose from 'mongoose';

const CurationSchema = new mongoose.Schema({
  previous_batch_id: {
    type: String,
    required: true
  },
  previous_smiles: String,
  new_batch_id: {
    type: String,
    required: true
  },
  new_smiles: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  reason: String,
  timestamp: {
    type: Date,
    'default': Date.now
  },
});

const Curation = mongoose.model('curations', CurationSchema);

export default Curation;
