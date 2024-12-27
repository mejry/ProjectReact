const mongoose = require('mongoose');
const userSchema = require('./user');
const leaveSchema = require('./leave');
const timeSheetSchema = require('./timeSheet');
const performanceSchema = require('./performance');
const notificationSchema = require('./notification');

// Create models only if they haven't been compiled yet
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Leave = mongoose.models.Leave || mongoose.model('Leave', leaveSchema);
const TimeSheet = mongoose.models.TimeSheet || mongoose.model('TimeSheet', timeSheetSchema);
const Performance = mongoose.models.Performance || mongoose.model('Performance', performanceSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

module.exports = {
  User,
  Leave,
  TimeSheet,
  Performance,
  Notification
};