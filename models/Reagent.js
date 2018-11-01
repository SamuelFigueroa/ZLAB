import mongoose from 'mongoose';
const ObjectId = mongoose.Schema.Types.ObjectId;

const ReagentSchema = new mongoose.Schema({
  containers: {
    type: [String],
    required: true
  },
  structure: String,  //SMILES structure
  reagent_id: String,  //e.g. R012345 (internal ID, Base64 of reagent's oid, will not change upon structure curation) CAS_NO
  name: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true,
    enum: ['L', 'S', 'Soln', 'G', 'Susp']
  },
  comment: String,
  attributes: [String],
  safety: Document,
  flags: [String],
  storage: String,
  cas: String,
  // history: [{
  //   src_container: {
  //     type: ObjectId,
  //     required: true
  //   },
  //   amount: {
  //     type: Number,
  //     required: true
  //   },
  //   amount_units: {
  //     type: String,
  //     required: true,
  //     enum: ['mg', 'g', 'kg', 'uL', 'mL', 'L']
  //   },
  //   date: {
  //     type: Date,
  //     'default': Date.now
  //   },
  //   comment: String
  // }],
  registration_date: {
    type: Date,
    'default': Date.now
  }
});

const Reagent = mongoose.model('reagents', ReagentSchema);

export default Reagent;
