import mongoose from 'mongoose';
const ObjectId = mongoose.Schema.Types.ObjectId;

const SafetyDataSheetSchema = new mongoose.Schema({
  compound: {
    type: ObjectId,
    required: true
  },
  document: {
    type: ObjectId,
    required: true
  },
  sds_id: String,
  manufacturer: String,
  signal_word: String,
  pictograms: [String],
  p_statements: [String],
  h_statements: [String]
});


const SafetyDataSheet = mongoose.model('safetyDataSheets', SafetyDataSheetSchema);

export default SafetyDataSheet;
