const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  group_name: { type: String, required: true },
  group_pin: { type: String, required: true, unique: true },
  head_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', GroupSchema);