const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['leave_request', 'leave_status', 'timesheet_reminder', 'performance_review', 'document_uploaded'],
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  importance: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Notification', notificationSchema);