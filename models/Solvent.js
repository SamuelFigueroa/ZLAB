import mongoose from 'mongoose';

const SolventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  composition: [{
    reagent_id: String,
    volume_percent: Number
  }],
  comment: String
});

const Solvent = mongoose.model('solvents', SolventSchema);

export default Solvent;
