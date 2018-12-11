import mongoose from 'mongoose';
const ObjectId = mongoose.Schema.Types.ObjectId;

const ContainerSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['Reagent', 'Sample'],
    required: true
  },
  barcode: {
    type: String,
    required: true
  },
  content: {
    type: ObjectId,
    required: true
  },
  //Batch info
  batch_id: {
    type: String,
    required: true
  },
  //Source info
  vendor: String,
  catalog_id: String,
  institution: String,
  researcher: String,
  eln_id: String, //Determines batch id
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
});

const Container = mongoose.model('containers', ContainerSchema);

export default Container;
