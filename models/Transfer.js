import mongoose from 'mongoose';
const ObjectId = mongoose.Schema.Types.ObjectId;

const TransferSchema = new mongoose.Schema({
  //Sample handling info
  source: ObjectId,
  destination: ObjectId,
  kind: {
    type: String,
    required: true,
    enum: ['mass', 'volume', 'drying', 'resuspension'],
  },
  amount: Number,
  amount_units: String,
  solvent: String,
  timestamp: {
    type: Date,
    'default': Date.now
  },
});

const Transfer = mongoose.model('transfers', TransferSchema);

export default Transfer;
