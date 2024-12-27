const { Notification } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

// Get user's notifications
const getNotifications = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const notifications = await Notification.find({ user: req.user._id })
    .sort('-createdAt')
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  const total = await Notification.countDocuments({ user: req.user._id });

  res.json({
    notifications,
    page,
    pages: Math.ceil(total / pageSize),
    total
  });
});

// Get unread notifications count
const getUnreadNotifications = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    user: req.user._id,
    read: false
  });

  res.json({ unreadCount: count });
});

// Mark notification as read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  notification.read = true;
  await notification.save();

  res.json(notification);
});

// Mark all notifications as read
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { read: true }
  );

  res.json({ message: 'All notifications marked as read' });
});

// Delete notification
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  await notification.deleteOne();
  res.json({ message: 'Notification removed' });
});

// Create notification (internal use)
const createNotification = async (userId, data) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title: data.title,
      message: data.message,
      type: data.type,
      importance: data.importance || 'medium'
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

module.exports = {
  getNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
};