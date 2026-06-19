const mongoose = require('mongoose');
const doctorSchema = new mongoose.Schema(
  {
    password: { type: String, required: true }, // ضروري تزيد required
    firstName: { type: String, required: true },
    familyName: { type: String, required: true }, // ✅ بدل lastName بـ familyName
    
    dateOfBirth: Date,
    gender: String,            
    phoneNumber: { type: String, required: true, unique: true }, // ضروري للصحة
    email: String,
    address: String,
    profilePicture: String,

    licenseNumber: String,
    specializations: [String],
    experience: Number,        
    department: String,
    hospitalId: String,
    consultationFee: Number,

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
    collection: 'Doctors',
  }
);

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;