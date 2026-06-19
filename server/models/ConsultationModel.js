const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor',  // ✅ 'Doctor' بحرف كبير (يطابق doctorModel.js)
    required: true 
  },
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient', // ✅ تأكد أن PatientModel مسجل بـ 'Patient'
    required: true 
  },
  nurseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Nurse', // ✅ تأكد أن NurseModel مسجل بـ 'Nurse'
    default: null 
  },
  type: { 
    type: String, 
    enum: ['Instant', 'Scheduled'], 
    required: true 
  },
  priority: { 
    type: Number, 
    enum: [1, 2], 
    default: 2
  },
  notes: { 
    type: String, 
    required: true 
  },
  consultationDate: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  }
  // ✅ حيدنا createdAt يدوي حيت { timestamps: true } غادي يديرو أوتوماتيك
}, { timestamps: true });

// ✅ حماية من OverwriteModelError
const Consultation = mongoose.models.Consultation || mongoose.model('Consultation', consultationSchema);
module.exports = Consultation;