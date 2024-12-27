import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, CheckCheck, X, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useNotifications } from '../../context/NotificationContext';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { Loading } from '../ui/loading';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loading
  } = useNotifications();

  // Close dropdown when clicking outside
  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
  };

  const getNotificationIcon = (type) => {
    const iconProps = { className: "h-5 w-5" };
    switch (type) {
      case 'leave_request':
        return <span className="text-blue-500">🌴</span>;
      case 'leave_status':
        return <span className="text-green-500">✓</span>;
      case 'timesheet_reminder':
        return <Clock {...iconProps} className="h-5 w-5 text-orange-500" />;
      case 'performance_review':
        return <span className="text-yellow-500">⭐</span>;
      case 'document_uploaded':
        return <span className="text-purple-500">📄</span>;
      default:
        return <Bell {...iconProps} className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (importance) => {
    switch (importance) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'medium':
        return 'border-l-4 border-yellow-500';
      default:
        return 'border-l-4 border-blue-500';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 mt-2 w-96 max-h-[80vh] overflow-hidden z-50 shadow-lg">
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-700">Notifications</h3>
            {notifications.length > 0 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
              </div>
            )}
          </div>

          <div className="overflow-y-auto max-h-[calc(80vh-4rem)]">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loading size="lg" />
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`${getNotificationColor(notification.importance)} ${
                      !notification.read ? 'bg-blue-50' : ''
                    } hover:bg-gray-50 transition-colors duration-150`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {getTimeAgo(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="hover:bg-blue-100 p-1"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4 text-blue-500" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="hover:bg-red-100 p-1"
                            title="Delete notification"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                <Bell className="h-8 w-8 mb-2 text-gray-400" />
                <p>No notifications</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 bg-gray-50 border-t text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default NotificationDropdown;