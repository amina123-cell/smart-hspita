const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'userModel', // ✅ ربط ديناميكي (Patient, Doctor, Nurse, Admin)
    index: true 
  },
  userModel: {
    type: String,
    enum: ['Patient', 'Doctor', 'Nurse', 'Admin'], // ✅ تحديد نوع المستخدم
    required: true
  },
  type: { 
    type: String, 
    // ✅ توسيع القائمة لتشمل كل أنواع الإشعارات اللي استعملناها
    enum: [
      'consultation',          // استشارة جديدة
      'consultation_status',   // تحديث حالة الاستشارة (للمريض)
      'vital_update',          // تحديث علامات حيوية
      'system_alert',          // تنبيهات النظام (للأدمن)
      'task_assigned',         // مهمة معينة (للممرض)
      'message'                // رسائل عامة
    ], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed }, // بيانات إضافية مثل consultationId
  isRead: { type: Boolean, default: false }
}, { 
  timestamps: true, // يضيف createdAt و updatedAt أوتوماتيكياً
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ✅ فهرس مركب لتسريع جلب الإشعارات غير المقروءة حسب الوقت
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// ✅ حماية من OverwriteModelError
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

module.exports = Notification;