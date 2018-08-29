import mongoose from 'mongoose';
const ObjectId = mongoose.Schema.Types.ObjectId;

// Researcher's exist as a source of samples.
const ResearcherSchema = new mongoose.Schema({
  abbreviation: String,
  name: {
    type: String,
    required: true
  },
  institution: {
    type: ObjectId,
    required: true
  },
  email: String,
  researcher_type: {
    type: String,
    enum: ['Chemist', 'Biologist', 'Researcher'],
    'default': 'Researcher'
  }
});

const Researcher = mongoose.model('researchers', ResearcherSchema);

export default Researcher;
