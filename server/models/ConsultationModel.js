const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor',  
    required: true 
  },
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true 
  },
  nurseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Nurse', 
    default: null 
  },
  
  // ✅ نوع الاستشارة
  type: { 
    type: String, 
    enum: ['Instant', 'Scheduled'], 
    required: true 
  },

  // ✅ نظام التصنيف الجديد (Triage System)
  triageLevel: {
    type: String,
    enum: ['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5'],
    default: 'LEVEL_3' // افتراضي للحالات المستقرة
  },
  
  // ✅ مصدر التصنيف (مهم للشفافية القانونية)
  triageSource: {
    type: String,
    enum: ['SELF_REPORTED', 'CLINICAL_MEASUREMENT', 'HYBRID'],
    default: 'SELF_REPORTED'
  },

  // ✅ الأعراض المبلغ عنها ذاتياً (للمنصات عن بعد)
  selfReportedSymptoms: [{
    symptom: String,      // مثال: 'ألم صدري'
    severity: { type: Number, min: 1, max: 10 }, // شدة الألم
    duration: String      // مدة العرض
  }],

  // ✅ العلامات الحيوية (تدخل فقط من طرف الطاقم الطبي)
  vitalSigns: {
    systolicBP: { type: Number }, // ضغط الدم الانقباضي
    heartRate: { type: Number },  // النبض
    respiratoryRate: { type: Number }, // التنفس
    spO2: { type: Number },       // تشبع الأكسجين
    temperature: { type: Number }, // الحرارة
    gcs: { type: Number },        // مستوى الوعي
    enteredBy: { 
      type: String, 
      enum: ['NURSE', 'DOCTOR', 'SYSTEM'], 
      default: 'SYSTEM' 
    }
  },

  // ✅ ملاحظات إضافية
  notes: { 
    type: String, 
    required: true 
  },

  // ✅ تاريخ وموعد الاستشارة
  consultationDate: { 
    type: Date, 
    required: true 
  },

  // ✅ حالة الاستشارة
  status: { 
    type: String, 
    enum: ['Pending', 'In-Progress', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  }

}, { timestamps: true });

// ✅ إضافة Index لتحسين سرعة البحث والفرز حسب الأولوية والتاريخ
consultationSchema.index({ triageLevel: 1, consultationDate: 1 });

// ✅ حماية من OverwriteModelError
const Consultation = mongoose.models.Consultation || mongoose.model('Consultation', consultationSchema);

module.exports = Consultation;