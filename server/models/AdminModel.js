const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    // معلومات الدخول والشخصية
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    familyName: { type: String, required: true },
    phoneNumber: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true 
    },
    address: String,
    profilePicture: String,

    // معلومات وظيفية
    department: String,
    role: { type: String, default: 'admin' },
    permissions: [String],

    // معلومات النظام
    lastActive: Date,
    isActive: { type: Boolean, default: true },
    registeredAt: { type: Date, default: Date.now }
  },
  {
    collection: 'admins',
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password; // ✅ الأهم: إخفاء الباسورد
        delete ret.__v;      // ✅ إخفاء النسخة الداخلية
        // ❌ لا تحذف _id لأنه ضروري للتعامل مع الوثائق
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
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

module.exports = Admin;