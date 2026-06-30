const connectDB = require("../../database/dbconnection");
const Patient = require("../../models/patientModel");
const Consultation = require("../../models/consultationModel"); // ✅ استيراد موديل الاستشارات
const Notification = require("../../models/NotificationModel"); // ✅ استيراد موديل الإشعارات
const express = require("express");

const router = express.Router();

// ... (كود POST / الموجود سابقاً كما هو) ...
router.post("/", async (req, res) => {
  const {
    password, firstName, familyName, dateOfBirth, gender, phoneNumber,
    address, hasSocialSecurityCard, socialSecurityNumber, insuranceType,
    insuranceStatus, coveragePercentage, bloodGroup, chronicDiseases,
    allergies, emergencyContactName, emergencyContactPhone
  } = req.body;

  try {
    await connectDB();

    if (!password || !firstName || !familyName || !phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        message: "البيانات الأساسية ناقصة" 
      });
    }

    const newPatient = await Patient.create({
      password, firstName, familyName, dateOfBirth, gender, phoneNumber,
      address, hasSocialSecurityCard, socialSecurityNumber, insuranceType,
      insuranceStatus, coveragePercentage, bloodGroup, chronicDiseases,
      allergies, emergencyContactName, emergencyContactPhone
    });

    res.status(201).json({
      success: true,
      message: "تمت إضافة المريض بنجاح",
      data: { _id: newPatient._id, firstName: newPatient.firstName, familyName: newPatient.familyName }
    });

  } catch (error) {
    console.error("💥 Add Patient Error:", error.message);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "رقم الهاتف مسجل مسبقاً" });
    }
    res.status(500).json({ success: false, message: "خطأ في السيرفر", error: error.message });
  }
});

// ✅✅✅ المسار الجديد والمحسّن لتحديث العلامات الحيوية
router.put("/:id/update-vitals", async (req, res) => {
  try {
    const { id } = req.params;
    const { vitalSigns, triageLevel, notes, consultationId } = req.body; // ✅ استقبال consultationId

    // 1. تحديث بيانات المريض العامة (آخر قياسات)
    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      { 
        $set: { 
          lastVitalSigns: vitalSigns, 
          lastTriageLevel: triageLevel,
          updatedAt: new Date()
        } 
      },
      { new: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ success: false, message: "المريض غير موجود" });
    }

    // 2. ✅ إذا كان هناك استشارة مجدولة مرتبطة، نقوم بتحديثها أيضاً
    if (consultationId) {
      await Consultation.findByIdAndUpdate(consultationId, {
        $set: {
          vitalSigns: vitalSigns,
          triageLevel: triageLevel,
          notes: notes || 'تم تحديث العلامات الحيوية من قبل المريض قبل الموعد'
        }
      });
    }

    // 3. إرسال إشعار للطبيب المعالج (إذا كان مرتبطاً بالمريض أو بالاستشارة)
    const doctorId = updatedPatient.doctorId; // يمكن جلبه من الاستشارة أيضاً إذا لزم الأمر
    
    if (doctorId) {
      await new Notification({
        userId: doctorId,
        type: 'vital_update',
        title: '🩺 تحديث علامات حيوية',
        message: `المريض ${updatedPatient.firstName} قام بتحديث علاماته الحيوية${consultationId ? ' لاستشارة مجدولة' : ''}.`,
        data: {
          patientId: updatedPatient._id,
          consultationId: consultationId,
          vitalSigns: vitalSigns,
          level: triageLevel
        },
        isRead: false
      }).save();
    } else {
      console.log("⚠️ No doctor assigned to this patient yet.");
    }

    res.json({ 
      success: true, 
      message: "تم تحديث العلامات الحيوية بنجاح", 
      data: updatedPatient 
    });

  } catch (error) {
    console.error("Update Vitals Error:", error);
    res.status(500).json({ success: false, message: "خطأ في السيرفر", error: error.message });
  }
});

module.exports = router;