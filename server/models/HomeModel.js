const mongoose = require('mongoose');

const homeSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },                // عنوان المنشور
    content: { 
      type: String, 
      required: true 
    },              // محتوى المنشور
    type: { 
      type: String, 
      enum: ['info', 'warning', 'success', 'emergency'],
      default: 'info'
    },                 // نوع المنشور
    priority: { 
      type: Number, 
      min: 1, 
      max: 5, 
      default: 3 
    },             // أولوية من 1 إلى 5
    targetAudience: { 
      type: String, 
      enum: ['all', 'patients', 'doctors', 'nurses', 'admins'],
      default: 'all'
    },       // الجمهور المستهدف
    startDate: { 
      type: Date, 
      default: Date.now 
    },              // تاريخ البداية
    endDate: Date,                // تاريخ النهاية (اختياري)
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: { 
      type: String 
    },            // معرف الشخص اللي أنشأ المنشور
    registeredAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'home', // ✅ مطابق تماماً لاسم الكولكشن في Compass
    timestamps: true    // ✅ يضيف createdAt و updatedAt أوتوماتيكياً
  }
);

// ✅ حماية من خطأ OverwriteModelError
const Home = mongoose.models.Home || mongoose.model('Home', homeSchema);

module.exports = Home;