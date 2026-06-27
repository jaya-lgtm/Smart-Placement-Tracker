import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import API from '../utils/api';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [dismissedList, setDismissedList] = useState(() => {
    const saved = localStorage.getItem('dismissed_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const fetchNotificationTriggers = async () => {
    if (!user) return;
    try {
      // Fetch applications and interviews
      const [appRes, intRes] = await Promise.all([
        API.get('/applications'),
        API.get('/interviews')
      ]);

      const apps = appRes.data;
      const ints = intRes.data;

      const computedNotifications = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check applications
      apps.forEach(app => {
        if (app.status === 'Selected' || app.status === 'Rejected') return;

        const deadline = new Date(app.deadlineDate);
        deadline.setHours(0, 0, 0, 0);
        const timeDiff = deadline.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysDiff < 0) {
          computedNotifications.push({
            id: `app-overdue-${app._id}`,
            type: 'danger',
            title: 'Deadline Passed',
            message: `${app.companyName} (${app.role}) deadline was on ${new Date(app.deadlineDate).toLocaleDateString()}`,
            date: app.deadlineDate,
            rawDate: deadline
          });
        } else if (daysDiff >= 0 && daysDiff <= 2) {
          const daysText = daysDiff === 0 ? 'today' : daysDiff === 1 ? '1 day left' : '2 days left';
          computedNotifications.push({
            id: `app-warning-${app._id}`,
            type: 'warning',
            title: 'Deadline Approaching',
            message: `${app.companyName} (${app.role}) deadline is ${daysText}!`,
            date: app.deadlineDate,
            rawDate: deadline
          });
        }
      });

      // Check interviews
      ints.forEach(interview => {
        if (interview.result === 'Selected' || interview.result === 'Rejected') return;

        const intDate = new Date(interview.interviewDate);
        intDate.setHours(0, 0, 0, 0);
        const timeDiff = intDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysDiff >= 0 && daysDiff <= 2) {
          const daysText = daysDiff === 0 ? 'today' : daysDiff === 1 ? 'tomorrow' : 'in 2 days';
          computedNotifications.push({
            id: `int-warning-${interview._id}`,
            type: 'info',
            title: 'Interview Scheduled',
            message: `Interview with ${interview.companyName} (${interview.role}) is ${daysText}!`,
            date: interview.interviewDate,
            rawDate: intDate
          });
        }
      });

      // Sort notifications by urgency (earliest deadline/interview first)
      computedNotifications.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Filter out dismissed notifications
      const activeNotifications = computedNotifications.filter(n => !dismissedList.includes(n.id));

      // Trigger toast notifications for newly computed warnings that haven't been shown in this render cycle
      const prevNotificationIds = notifications.map(n => n.id);
      activeNotifications.forEach(n => {
        if (!prevNotificationIds.includes(n.id)) {
          if (n.type === 'danger') {
            toast.error(n.message, { toastId: n.id, autoClose: 5000 });
          } else if (n.type === 'warning') {
            toast.warning(n.message, { toastId: n.id, autoClose: 5000 });
          } else {
            toast.info(n.message, { toastId: n.id, autoClose: 5000 });
          }
        }
      });

      setNotifications(activeNotifications);
    } catch (error) {
      console.error('Error fetching notification triggers:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotificationTriggers();
      // Poll every 60 seconds to keep fresh
      const interval = setInterval(fetchNotificationTriggers, 60000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user, dismissedList]);

  // Method to trigger manual toast notifications when actions happen
  const notifySuccess = (message) => {
    toast.success(message);
  };

  const notifyError = (message) => {
    toast.error(message);
  };

  // Dismiss a notification
  const dismissNotification = (id) => {
    const updatedDismissedList = [...dismissedList, id];
    setDismissedList(updatedDismissedList);
    localStorage.setItem('dismissed_notifications', JSON.stringify(updatedDismissedList));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    const allIds = notifications.map(n => n.id);
    const updatedDismissedList = [...dismissedList, ...allIds];
    setDismissedList(updatedDismissedList);
    localStorage.setItem('dismissed_notifications', JSON.stringify(updatedDismissedList));
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      dismissNotification,
      clearAllNotifications,
      notifySuccess,
      notifyError,
      triggerRefresh: fetchNotificationTriggers
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
