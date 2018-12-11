import mongoose from 'mongoose';
const ObjectId = mongoose.Schema.Types.ObjectId;

const CompoundSchema = new mongoose.Schema({
  containers: [ObjectId],
  //Compound info
  smiles: String,
  compound_id: {
    type: String,
    required: true
  },
  name: String,
  description: String,
  attributes: [String],
  safety: ObjectId,
  flags: [String],
  storage: String,
  cas: String,
  batchCount: {
    type: Number,
    'default': 0
  },
  registration_event: {
    user: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      'default': Date.now
    }
  },
});

CompoundSchema.statics.getNextBatchId = async function(compound_id) {
  let document = await this.findOneAndUpdate({ compound_id },
    { $inc : { batchCount : 1 } },
    { new : true });

  return document.compound_id + '-' + document.batchCount.toString().padStart(3, '0');
};

const Compound = mongoose.model('compounds', CompoundSchema);

export default Compound;
