import React, { useState, useEffect } from "react";
import "./NotificationBell.css";

export default function NotificationBell({ userId, onNotificationClick }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ جلب الإشعارات (روابط مباشرة بدون /api/)
  const fetchNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // ✅ التصحيح: رابط مباشر
      const res = await fetch(`http://localhost:5000/notifications/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("❌ Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // ✅ تحديث كل 30 ثانية
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // ✅ تحديد إشعار كمقروء (رابط مباشر)
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      // ✅ التصحيح: رابط مباشر
      await fetch(`http://localhost:5000/notifications/${notification._id}`, {
        method: 'PUT'
      });
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    setNotifications(prev => 
      prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
    );
    
    setShowDropdown(false);
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  // ✅ تحديد الكل كمقروء (رابط مباشر)
  const handleMarkAllAsRead = async () => {
    // ✅ التصحيح: رابط مباشر
    await fetch(`http://localhost:5000/notifications/mark-all/${userId}`, {
      method: 'PUT'
    });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  // ✅ تنسيق الوقت
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "الآن";
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return date.toLocaleDateString('ar-DZ');
  };

  return (
    <div className="notification-bell">
      <button 
        className="bell-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>📬 الإشعارات</h3>
            {unreadCount > 0 && (
              <button className="mark-all-read" onClick={handleMarkAllAsRead}>
                تحديد الكل كمقروء
              </button>
            )}
          </div>
          
          <div className="dropdown-content">
            {loading ? (
              <div className="loading-notifications">⏳ جاري التحميل...</div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">لا توجد إشعارات جديدة</div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {notification.type === 'consultation' ? '📋' : '🔔'}
                  </div>
                  <div className="notification-content">
                    <h4 className="notification-title">{notification.title}</h4>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{formatTime(notification.createdAt)}</span>
                  </div>
                  {!notification.isRead && <div className="unread-dot"></div>}
                </div>
              ))
            )}
          </div>
          
          <div className="dropdown-footer">
            <button onClick={() => setShowDropdown(false)}>إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
}