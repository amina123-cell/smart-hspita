const express = require('express');
const router = express.Router();
const Consultation = require('../../models/ConsultationModel');
const TriageLog = require('../../models/triageLogModel'); // ✅ استيراد موديل السجل

// ✅ تحديث تصنيف الاستشارة والعلامات الحيوية
router.put('/:id/triage', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      triageLevel, 
      selfReportedSymptoms, 
      vitalSigns, 
      enteredBy,     // 'NURSE' | 'DOCTOR' | 'SYSTEM'
      userId,        // ✅ معرف المستخدم الحالي (من الـ Token أو الجلسة)
      userModel,     // ✅ نوع المستخدم ('Doctor' | 'Nurse' | 'Admin')
      reason         // ✅ سبب تغيير التصنيف (اختياري)
    } = req.body;

    // 1️⃣ التحقق من وجود الاستشارة
    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'استشارة غير موجودة' });
    }

    // 2️⃣ تحديد مصدر التصنيف تلقائياً
    let source = consultation.triageSource || 'SELF_REPORTED';
    
    // إذا دخل الممرض/الطبيب علامات حيوية حقيقية، نغير المصدر لـ CLINICAL
    if (vitalSigns && Object.keys(vitalSigns).length > 0 && enteredBy !== 'SYSTEM') {
      source = 'CLINICAL_MEASUREMENT';
    } 
    // إذا كان هناك أعراض ذاتية + علامات حيوية، نعتبره HYBRID
    else if (selfReportedSymptoms?.length > 0 && vitalSigns && Object.keys(vitalSigns).length > 0) {
      source = 'HYBRID';
    }

    // 3️⃣ منع المريض من رفع التصنيف الذاتي فوق LEVEL_2
    if (source === 'SELF_REPORTED' && ['LEVEL_1'].includes(triageLevel)) {
      return res.status(400).json({ 
        success: false, 
        message: 'لا يمكن تصنيف الحالة كـ إنعاش بناءً على تقرير ذاتي فقط' 
      });
    }

    // ✅ 4️⃣ تسجيل التغيير في Audit Log (إذا تغير المستوى)
    if (triageLevel && triageLevel !== consultation.triageLevel) {
      await TriageLog.create({
        consultationId: id,
        oldLevel: consultation.triageLevel,
        newLevel: triageLevel,
        changedBy: userId || null,       // حفظ المعرف حتى لو لم يتم إرساله
        changedByModel: userModel || 'System',
        reason: reason || 'تحديث روتيني للتصنيف',
        vitalSignsSnapshot: vitalSigns || consultation.vitalSigns
      });
    }

    // 5️⃣ تحديث بيانات الاستشارة
    const updatedConsultation = await Consultation.findByIdAndUpdate(
      id,
      {
        $set: {
          triageLevel: triageLevel || consultation.triageLevel,
          triageSource: source,
          selfReportedSymptoms: selfReportedSymptoms || consultation.selfReportedSymptoms,
          'vitalSigns.systolicBP': vitalSigns?.systolicBP ?? consultation.vitalSigns?.systolicBP,
          'vitalSigns.heartRate': vitalSigns?.heartRate ?? consultation.vitalSigns?.heartRate,
          'vitalSigns.respiratoryRate': vitalSigns?.respiratoryRate ?? consultation.vitalSigns?.respiratoryRate,
          'vitalSigns.spO2': vitalSigns?.spO2 ?? consultation.vitalSigns?.spO2,
          'vitalSigns.temperature': vitalSigns?.temperature ?? consultation.vitalSigns?.temperature,
          'vitalSigns.gcs': vitalSigns?.gcs ?? consultation.vitalSigns?.gcs,
          'vitalSigns.enteredBy': enteredBy || consultation.vitalSigns?.enteredBy
        }
      },
      { new: true, runValidators: true }
    );

    res.json({ 
      success: true, 
      message: 'تم تحديث التصنيف وتسجيل التغيير بنجاح', 
      data: updatedConsultation 
    });

  } catch (error) {
    console.error('❌ Triage Update Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في السيرفر', 
      error: error.message 
    });
  }
});

module.exports = router;