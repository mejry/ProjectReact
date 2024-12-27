import { useCallback } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { notificationService, createNotification } from '../services/notificationService';

export const useNotificationActions = () => {
  const { addNotification } = useNotifications();

  const notifyLeaveRequest = useCallback(async (leaveData) => {
    try {
      const notification = await createNotification('leave_request', {
        employeeName: leaveData.employeeName,
        startDate: leaveData.startDate,
        endDate: leaveData.endDate,
      });
      addNotification(notification);
    } catch (error) {
      console.error('Failed to create leave request notification:', error);
    }
  }, [addNotification]);

  const notifyLeaveStatus = useCallback(async (leaveData) => {
    try {
      const notification = await createNotification('leave_status', {
        employeeId: leaveData.employeeId,
        status: leaveData.status,
      });
      addNotification(notification);
    } catch (error) {
      console.error('Failed to create leave status notification:', error);
    }
  }, [addNotification]);

  const notifyTimesheetReminder = useCallback(async (userId) => {
    try {
      const notification = await createNotification('timesheet_reminder', {
        targetUserId: userId,
      });
      addNotification(notification);
    } catch (error) {
      console.error('Failed to create timesheet reminder notification:', error);
    }
  }, [addNotification]);

  const notifyPerformanceReview = useCallback(async (reviewData) => {
    try {
      const notification = await createNotification('performance_review', {
        employeeId: reviewData.employeeId,
        period: reviewData.period,
      });
      addNotification(notification);
    } catch (error) {
      console.error('Failed to create performance review notification:', error);
    }
  }, [addNotification]);

  const notifyDocumentUpload = useCallback(async (documentData) => {
    try {
      const notification = await createNotification('document_uploaded', {
        documentName: documentData.name,
        targetUserId: documentData.targetUserId,
      });
      addNotification(notification);
    } catch (error) {
      console.error('Failed to create document upload notification:', error);
    }
  }, [addNotification]);

  return {
    notifyLeaveRequest,
    notifyLeaveStatus,
    notifyTimesheetReminder,
    notifyPerformanceReview,
    notifyDocumentUpload,
  };
};