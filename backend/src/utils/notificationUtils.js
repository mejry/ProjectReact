const { createNotification } = require('../controllers/notificationController');

const sendNotification = async (userId, io, data) => {
  try {
    const notification = await createNotification(userId, data);

    // If socket.io instance is available, emit to user
    if (io) {
      io.to(userId.toString()).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

const notificationTemplates = {
  LEAVE_REQUEST: (requesterName) => ({
    title: 'New Leave Request',
    message: `${requesterName} has submitted a new leave request`,
    type: 'leave_request',
    importance: 'medium'
  }),

  LEAVE_STATUS_UPDATE: (status) => ({
    title: 'Leave Request Update',
    message: `Your leave request has been ${status}`,
    type: 'leave_status',
    importance: 'high'
  }),

  TIMESHEET_REMINDER: {
    title: 'Timesheet Reminder',
    message: 'Please submit your timesheet for this week',
    type: 'timesheet_reminder',
    importance: 'medium'
  },

  NEW_PERFORMANCE_REVIEW: {
    title: 'New Performance Review',
    message: 'A new performance review has been created for you',
    type: 'performance_review',
    importance: 'high'
  }
};

module.exports = {
  sendNotification,
  notificationTemplates
};