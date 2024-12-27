const express = require('express');
const { protect, admin } = require('../middleware/auth');
const userController = require('../controllers/userController');
const leaveController = require('../controllers/leaveController');
const timesheetController = require('../controllers/timesheetController');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

// User routes
router.get('/users/profile', protect, userController.getProfile);
router.put('/users/profile', protect, userController.updateProfile);
router.put('/users/password', protect, userController.updatePassword);

// Leave routes
router.get('/leaves/balance', protect, leaveController.getLeaveBalance);
router.get('/leaves/all', protect, admin, leaveController.getAllLeaves);

// Timesheet routes
router.get('/timesheet/summary', protect, timesheetController.getTimesheetSummary);
router.put('/timesheet/bulk', protect, timesheetController.bulkUpdateTimesheet);

// Notification routes
router.get('/notifications', protect, notificationController.getNotifications);
router.put('/notifications/:id/read', protect, notificationController.markAsRead);
router.put('/notifications/mark-all-read', protect, notificationController.markAllAsRead);
router.delete('/notifications/:id', protect, notificationController.deleteNotification);

module.exports = router;