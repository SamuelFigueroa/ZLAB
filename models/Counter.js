import mongoose from 'mongoose';

const CounterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  prefix: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    'default': 0
  },
  numDigits: {
    type: Number,
    required: true
  }
});

CounterSchema.statics.getNextSequenceValue = async function(name) {
  let document = await this.findOneAndUpdate({ name },
    { $inc : { value : 1 } },
    { new : true });

  return document.prefix + document.value.toString().padStart(document.numDigits, '0');
};

const Counter = mongoose.model('counters', CounterSchema);

export default Counter;
