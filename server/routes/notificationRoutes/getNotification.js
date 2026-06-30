const connectDB = require("../../database/dbconnection");
const Notification = require("../../models/NotificationModel");
const express = require("express");

const router = express.Router();

// ✅ جلب إشعارات المستخدم (مع فلترة حسب الدور)
router.get("/:userId", async (req, res) => {
  try {
    await connectDB();
    const { userId } = req.params;
    const { type } = req.query; // ✅ استقبال نوع المستخدم من الواجهة (doctor, admin, nurse, patient)
    
    let query = { userId };

    // ✅ منطق الفلترة الذكي حسب الدور
    if (type === 'admin') {
      // الأدمن يشوف إشعارات النظام والاستشارات العامة
      query.type = { $in: ['system_alert', 'vital_update', 'consultation'] };
    } else if (type === 'doctor') {
      // الطبيب يشوف الاستشارات الموجهة له وتحديثات العلامات الحيوية
      query.type = { $in: ['consultation', 'vital_update'] };
    } else if (type === 'nurse') {
      // الممرض يشوف الاستشارات والمهام
      query.type = { $in: ['consultation', 'task_assigned'] };
    } else if (type === 'patient') {
      // المريض يشوف حالة استشاراته فقط
      query.type = { $in: ['consultation_status'] };
    }
    // إذا لم يتم تحديد type، يرجع كل الإشعارات (للأمان)

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50); // آخر 50 إشعار
    
    const unreadCount = await Notification.countDocuments({ 
      ...query, // تطبيق نفس الفلترة على عدد غير المقروء
      isRead: false 
    });
    
    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("💥 Get Notifications Error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;