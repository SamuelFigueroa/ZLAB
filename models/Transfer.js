import mongoose from 'mongoose';
const ObjectId = mongoose.Schema.Types.ObjectId;

const TransferSchema = new mongoose.Schema({
  //Sample handling info
  source: {
    type: ObjectId,
    required: true
  },
  destination: {
    type: ObjectId,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  amount_units: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    'default': Date.now
  },
});

const Transfer = mongoose.model('transfers', TransferSchema);

export default Transfer;
