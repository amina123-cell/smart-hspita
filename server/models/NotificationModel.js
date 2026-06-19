const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    index: true // ✅ فهرس ضروري لتسريع جلب إشعارات المستخدم
  },
  type: { 
    type: String, 
    enum: ['consultation', 'message', 'reminder'], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed }, // بيانات مرنة للإشعار
  isRead: { type: Boolean, default: false }
}, { 
  timestamps: true // ✅ يضيف createdAt و updatedAt أوتوماتيكياً (لا حاجة لإضافتهما يدوياً)
});

// ✅ حماية من OverwriteModelError
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

module.exports = Notification;