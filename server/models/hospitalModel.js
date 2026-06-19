const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    // ✅ المعلومات الأساسية (مطابقة تماماً لـ addHospital.js)
    name: { 
      type: String, 
      required: true,
      trim: true 
    },
    address: { 
      type: String, 
      required: true 
    },
    phoneNumber: { 
      type: String, 
      required: true, 
      unique: true, // ✅ يمنع تكرار نفس الرقم
      index: true   // ✅ يسرع البحث برقم الهاتف
    },
    email: { 
      type: String, 
      lowercase: true,
      trim: true 
    },
    
    // ✅ التفاصيل التقنية والهيكلية
    type: { 
      type: String, 
      enum: ['عام', 'خاص', 'عسكري', 'جامعي'],
      default: 'عام'
    },              // نوع المستشفى
    capacity: { 
      type: Number, 
      min: 0 
    },          // السعة الاستيعابية (عدد الأسرة)
    departments: [String],     // قائمة الأقسام الطبية
    
    // ✅ خدمات الطوارئ والإسعاف
    emergencyAvailable: {
      type: Boolean,
      default: false
    },
    emergencyPhone: String,
    
    // ✅ معلومات التواصل والتوثيق
    website: String,
    accreditation: String,     // شهادة الاعتماد أو التصنيف

    // ✅ معلومات النظام والتتبع
    registeredAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    collection: 'hospitals', // ✅ مطابق للاسم في MongoDB Compass
    timestamps: true         // ✅ يضيف createdAt و updatedAt تلقائياً
  }
);

// ✅ حماية من خطأ OverwriteModelError عند إعادة التشغيل
const Hospital = mongoose.models.Hospital || mongoose.model('Hospital', hospitalSchema);

module.exports = Hospital;