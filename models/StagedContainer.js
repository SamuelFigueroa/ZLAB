import mongoose from 'mongoose';

const ObjectId = mongoose.Schema.Types.ObjectId;

const StagedContainerSchema = new mongoose.Schema({
  collection_id: {
    type: ObjectId,
    required: true
  },
  collection_index: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['Reagent', 'Sample'],
    required: true
  },
  barcode: {
    type: String
  },
  content: {
    smiles: String,
    originalSmiles: String,
    name: String,
    cas: String,
    description: String,
    storage: String
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
      type: String,
      required: true
    },
    sub_area: {
      type: String,
      required: true
    }
  },
  owner: {
    type: String,
    required: true
  },
  description: String,
  registrationError: {
    key: {
      type: String,
    },
    message: {
      type: String,
    }
  }
});

const StagedContainer = mongoose.model('stagedContainers', StagedContainerSchema);

export default StagedContainer;
