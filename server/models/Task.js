const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'General' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assigned_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  due_date: { type: Date },
  completed_at: { type: Date },
  created_at: { type: Date, default: Date.now }
});

// FIX: Automatically convert _id to id for the frontend
taskSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    return ret;
  }
});

module.exports = mongoose.model('Task', taskSchema);