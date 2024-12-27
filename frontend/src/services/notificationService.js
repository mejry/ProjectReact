// notificationService.js

import api from './api';

export const notificationService = {
  getAll: async () => {
    const response = await api.get('/notifications');
    return response;
  },

  getUnread: async () => {
    const response = await api.get('/notifications/unread');
    return response;
  },

  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notifications/mark-all-read');
    return response;
  },

  delete: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response;
  },

  create: async (notificationData) => {
    const response = await api.post('/notifications', notificationData);
    return response;
  }
};

// Helper function to create notifications for different events
export const createNotification = async (type, data) => {
  const notificationData = {
    type,
    timestamp: new Date(),
    ...formatNotificationData(type, data),
  };

  return await notificationService.create(notificationData);
};

// Helper function to format notification data based on type
const formatNotificationData = (type, data) => {
  switch (type) {
    case 'leave_request':
      return {
        title: 'New Leave Request',
        message: `${data.employeeName} has requested leave from ${data.startDate} to ${data.endDate}`,
        importance: 'high',
        targetUsers: ['admin'],
      };

    case 'leave_status':
      return {
        title: 'Leave Request Updated',
        message: `Your leave request has been ${data.status}`,
        importance: 'high',
        targetUsers: [data.employeeId],
      };

    case 'timesheet_reminder':
      return {
        title: 'Timesheet Reminder',
        message: 'Please complete your timesheet for this week',
        importance: 'medium',
        targetUsers: ['all'],
      };

    case 'performance_review':
      return {
        title: 'New Performance Review',
        message: `Your performance review for ${data.period} is available`,
        importance: 'high',
        targetUsers: [data.employeeId],
      };

    case 'document_uploaded':
      return {
        title: 'New Document',
        message: `A new document "${data.documentName}" has been uploaded`,
        importance: 'low',
        targetUsers: [data.targetUserId],
      };

    default:
      return {
        title: 'System Notification',
        message: data.message,
        importance: 'low',
        targetUsers: ['all'],
      };
  }
};

export default notificationService;