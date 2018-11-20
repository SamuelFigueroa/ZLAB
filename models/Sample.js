import mongoose from 'mongoose';
const ObjectId = mongoose.Schema.Types.ObjectId;

const SampleSchema = new mongoose.Schema({
  containers: {
    type: [String],
    required: true
  },
  source: ObjectId,  //Will hold the ID of a registered source
  catalog_id: String,
  researcher: ObjectId,
  structure: String,  //SMILES structure
  sample_id: String,  //e.g. S012345 (internal ID, Base64 of sample's oid, will not change upon structure curation)
  zid: String,  //ZLIMS Compound ID (generated from parent structure, batch(instance))
  zid_aliases: [String],  //Previous ZIDs associated to the compound
  name: {
    type: String,
    required: true
  },
  description: String,
  project: ObjectId,
  collection: ObjectId,
  history: [{
    src_container: {
      type: ObjectId,
      required: true
    },
    dest_container: {
      type: ObjectId,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    amount_units: {
      type: String,
      required: true,
      enum: ['umol', 'mmol', 'mol']
    },
    date: {
      type: Date,
      'default': Date.now
    },
    description: String
  }],
  curations: [{
    previous_structure: {
      type: String,
      required: true
    },
    new_structure: {
      type: String,
      required: true
    },
    curation_date: {
      type: Date,
      'default': Date.now
    },
    author: {
      type: ObjectId, // Researcher's oid
      required: true
    },
    reason: String
  }],
  registration_date: {
    type: Date,
    'default': Date.now
  }
});

const Sample = mongoose.model('samples', SampleSchema);

export default Sample;
