import React, { useState, useEffect } from "react";
import "./NotificationBell.css"; // نفس ملف الستايل المشترك

export default function PatientNotificationBell({ userId, onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ جلب إشعارات المريض فقط
  const fetchNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // نطلب الإشعارات بفلتر خاص بالمريض
      const res = await fetch(`http://localhost:5000/notifications/${userId}?type=patient`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("❌ Failed to fetch patient notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // تحديث كل 30 ثانية (لا حاجة لتحديث سريع جداً للمريض)
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // ✅ معالجة النقر على الإشعار
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await fetch(`http://localhost:5000/notifications/${notification._id}/read`, {
        method: 'PUT'
      });
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    setNotifications(prev => 
      prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
    );
    
    setShowDropdown(false);

    // ✅ توجيه المريض لصفحة استشاراته عند النقر
    if (onNavigate) onNavigate("patientHome");
  };

  const handleMarkAllAsRead = async () => {
    await fetch(`http://localhost:5000/notifications/mark-all-read/${userId}`, {
      method: 'PUT'
    });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "الآن";
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    return date.toLocaleDateString('ar-DZ');
  };

  return (
    <div className="notification-bell-container">
      <button 
        className="bell-btn"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="badge-count">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notif-dropdown">
          <div className="dropdown-header">
            <h4>📬 إشعاراتي</h4>
            {unreadCount > 0 && (
              <button className="mark-read-btn" onClick={handleMarkAllAsRead}>
                تحديد الكل مقروء
              </button>
            )}
          </div>
          
          <div className="dropdown-list">
            {loading ? (
              <div className="loading-text">⏳ جاري التحميل...</div>
            ) : notifications.length === 0 ? (
              <div className="empty-notif">لا توجد إشعارات جديدة</div>
            ) : (
              notifications.slice(0, 5).map(notif => (
                <div
                  key={notif._id}
                  className={`notif-item ${notif.isRead ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="notif-icon">
                    {notif.type === 'consultation_status' ? '📅' : 'ℹ️'}
                  </div>
                  <div className="notif-content">
                    <p className="notif-title">{notif.title}</p>
                    <p className="notif-msg">{notif.message}</p>
                    <span className="notif-time">{formatTime(notif.createdAt)}</span>
                  </div>
                  {!notif.isRead && <div className="red-dot"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}