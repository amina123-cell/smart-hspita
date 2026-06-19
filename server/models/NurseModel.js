const mongoose = require('mongoose');

const nurseSchema = new mongoose.Schema(
  {
    password: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    familyName: { type: String, required: true, trim: true },
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female'] },
    
    // ✅ تم إلغاء القيد الفريد (Unique) للسماح بتكرار الأرقام عند الحاجة
    phoneNumber: { type: String, required: true }, 
    
    address: String,
    profilePicture: String,
    licenseNumber: String,
    department: String,
    shiftPreference: String,
    
    // ✅ تحويل المهارات والمرضى إلى روابط ذكية
    skills: [String],
    supervisor: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Nurse' // ربط بالمشرف المباشر
    },
    assignedPatients: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Patient' // ربط بالمرضى المسندين
    }],

    registeredAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
  },
  {
    collection: 'nurses', // ✅ مطابق للاسم في MongoDB Compass
    timestamps: true      // ✅ يضيف createdAt و updatedAt تلقائياً
  }
);

// ✅ إلغاء أي فهرس فريد سابق على رقم الهاتف لمنع الأخطاء
nurseSchema.index({ phoneNumber: 1 }, { unique: false });

// ✅ حماية من خطأ OverwriteModelError
const Nurse = mongoose.models.Nurse || mongoose.model('Nurse', nurseSchema);

module.exports = Nurse;