import mongoose from 'mongoose';
const ObjectId = mongoose.Schema.Types.ObjectId;

const MapSchema = new mongoose.Schema({
  building: {
    type: String,
    required: true
  },
  floor: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true
  },
  locations: [ObjectId]
});

const Map = mongoose.model('maps', MapSchema);

export default Map;
