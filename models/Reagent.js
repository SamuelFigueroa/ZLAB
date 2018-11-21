import mongoose from 'mongoose';
const ObjectId = mongoose.Schema.Types.ObjectId;

const ReagentSchema = new mongoose.Schema({
  containers: [{
    barcode: {
      type: String,
      required: true
    },
    content: {
      type: ObjectId,
      required: true
    },
    vendor: String,
    catalog_id: String,
    institution: String,
    chemist: String,
    state: {
      type: String,
      required: true,
      enum: ['L', 'S', 'Soln', 'G', 'Susp']
    },
    mass: Number,
    mass_units: String,
    volume: Number,
    vol_units: String,
    concentration: Number,
    conc_units: String,
    solvent: String,
    location: {
      area: {
        type: ObjectId,
        required: true
      },
      sub_area: {
        type: ObjectId,
        required: true
      }
    },
    owner: ObjectId,  // Current owner's researcher oid
    description: String,
    registration_event: {
      user: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        'default': Date.now
      }
    }
  }],
  smiles: String,
  compound_id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  attributes: [String],
  safety: ObjectId,
  flags: [String],
  storage: String,
  cas: String,
  registration_event: {
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

const Reagent = mongoose.model('reagents', ReagentSchema);

export default Reagent;
