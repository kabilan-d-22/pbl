const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Head', 'User'], required: true },
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },
  created_at: { type: Date, default: Date.now }
});

// Automatically convert _id to id when sending data to frontend
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);