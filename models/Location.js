import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  area: {
    name: {
      type: String,
      required: true
    },
    sub_areas: [{
      name: {
        type: String,
        required: true
      }
    }]
  }
});

const Location = mongoose.model('locations', LocationSchema);

export default Location;
