import mongoose from 'mongoose';

const CollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  members: [String]
});

const Collection = mongoose.model('collections', CollectionSchema);

export default Collection;
