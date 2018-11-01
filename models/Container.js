import mongoose from 'mongoose';
const ObjectId = mongoose.Schema.Types.ObjectId;

const ContainerSchema = new mongoose.Schema({
  barcode: {
    type: String,
    required: true
  },
  content: {
    type: ObjectId,
    required: true
  },
  source: String,  //Will hold the ID of a registered source
  catalog_id: String,
  chemist: String,
  // state: {
  //   type: String,
  //   required: true,
  //   enum: ['L', 'S', 'Soln', 'Susp']
  // },
  empty_weight: {
    weight: {
      type: Number
    },
    weight_units: {
      type: String,
      enum: ['mg', 'g', 'kg']
    }
  },
  filled_weight: {
    weight: {
      type: Number
    },
    weight_units: {
      type: String,
      enum: ['mg', 'g', 'kg']
    }
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
  weight: {
    type: Number
  },
  weight_units: {
    type: String,
    enum: ['mg', 'g', 'kg']
  },
  volume: {
    type: Number
  },
  volume_units: {
    type: String,
    enum: ['nL', 'uL', 'mL', 'L']
  },
  conc: {
    type: Number
  },
  conc_units: {
    type: String,
    enum: ['nM', 'uM', 'mM', 'M']
  },
  solvent: {
    type: ObjectId,
  },
  location: ObjectId,
  owner: ObjectId,  // Current owner's researcher oid
  comment: String,
  registration_date: {
    type: Date,
    'default': Date.now
  }
});

const Container = mongoose.model('containers', ContainerSchema);

export default Container;
