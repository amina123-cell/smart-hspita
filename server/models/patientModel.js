const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    // 🔐 معلومات الدخول
    password: { type: String, required: true },
    phoneNumber: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true // ✅ فهرس ضروري لتسريع البحث والتحقق
    },
    
    // 👤 معلومات شخصية
    firstName: { type: String, required: true, trim: true },
    familyName: { type: String, required: true, trim: true },
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female'] },
    address: String,

    // 🆔 معلومات الضمان الاجتماعي
    hasSocialSecurityCard: Boolean,
    socialSecurityNumber: String,
    insuranceType: String,
    insuranceStatus: String,
    coveragePercentage: Number,

    // 🏥 معلومات طبية أساسية
    bloodGroup: String,
    chronicDiseases: [String],
    allergies: [String],

    //  معلومات الطوارئ
    emergencyContactName: String,
    emergencyContactPhone: String,

    // ️ معلومات النظام
    isActive: { type: Boolean, default: true }
    // ✅ حيدنا registeredAt حيت timestamps غادي يدير createdAt أوتوماتيك
  },
  {
    collection: 'patients',
    timestamps: true, // ✅ يضيف createdAt و updatedAt أوتوماتيك
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password; // ✅ إخفاء الباسورد نهائياً
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// ✅ حماية من OverwriteModelError
const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);

module.exports = Patient;