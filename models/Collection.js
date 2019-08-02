import mongoose from 'mongoose';

const CollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Initial', 'Queued', 'InProgress', 'Error', 'Registered'],
    'default': 'Initial'
  },
  inProgress: {
    type: Boolean,
    index: {
      unique: true,
      partialFilterExpression: { inProgress: { $type: 'bool' } }
    }
  },
  item: {
    type: String,
    enum: ['StagedContainer']
  }
}, { timestamps: true });

const Collection = mongoose.model('collections', CollectionSchema);

export default Collection;
