const mongoose = require('mongoose');

const triageLogSchema = new mongoose.Schema({
  consultationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Consultation', 
    required: true,
    index: true // ✅ فهرس لتسريع البحث حسب الاستشارة
  },
  oldLevel: { 
    type: String, 
    enum: ['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5'],
    required: true 
  },
  newLevel: { 
    type: String, 
    enum: ['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5'],
    required: true 
  },
  changedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'changedByModel', // ✅ مرجع ديناميكي (طبيب، ممرض، أو مسؤول)
    required: true 
  },
  changedByModel: {
    type: String,
    enum: ['Doctor', 'Nurse', 'Admin'],
    required: true
  },
  reason: { 
    type: String, 
    trim: true,
    maxlength: 500 
  },
  vitalSignsSnapshot: {
    systolicBP: Number,
    heartRate: Number,
    spO2: Number,
    temperature: Number
  }
}, { timestamps: true });

// ✅ حماية من OverwriteModelError
const TriageLog = mongoose.models.TriageLog || mongoose.model('TriageLog', triageLogSchema);
module.exports = TriageLog;