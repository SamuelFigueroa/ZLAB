import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  login: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  admin: {
    type: Boolean,
    required: true
  }
});

const User = mongoose.model('users', UserSchema);

export default User;
