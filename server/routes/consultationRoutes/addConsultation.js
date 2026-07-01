const Consultation = require("../../models/ConsultationModel");
const Notification = require("../../models/NotificationModel");
const TriageLog = require("../../models/triageLogModel");
const Patient = require("../../models/patientModel");
const Doctor = require("../../models/doctorModel");
const Admin = require("../../models/AdminModel"); // ✅ استيراد موديل الأدمن
const mongoose = require("mongoose");
const express = require("express");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { 
      doctorId, patientId, nurseId, type, notes, consultationDate,
      triageLevel, vitalSigns, triageSource, reason, userId, userModel 
    } = req.body;

    // ✅ 1. التحقق من البيانات الأساسية
    if (!doctorId || !patientId || !type || !notes) {
      return res.status(400).json({ 
        success: false,
        message: "بيانات ناقصة",
        required: ["doctorId", "patientId", "type", "notes"]
      });
    }

    // ✅ 2. التحقق من تنسيق doctorId وتحويله لـ ObjectId
    let parsedDoctorId;
    try {
      parsedDoctorId = new mongoose.Types.ObjectId(doctorId);
    } catch (err) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid doctor ID format",
        received: doctorId
      });
    }

    // ✅ 3. التحقق من وجود الطبيب في الداتابيز
    const doctor = await Doctor.findById(parsedDoctorId);
    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        message: "Doctor not found",
        receivedId: doctorId,
        hint: "تأكد من اختيار طبيب صحيح من القائمة"
      });
    }

    // ✅ 4. التحقق من وجود المريض
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        message: "Patient not found",
        receivedId: patientId
      });
    }

    // ✅ 5. تحديد تاريخ الاستشارة
    const finalDate = type === 'Instant' 
      ? new Date() 
      : new Date(consultationDate);
    
    if (isNaN(finalDate.getTime())) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid consultation date"
      });
    }

    // ✅ 6. إنشاء الاستشارة الجديدة مع الحقول الحديثة
    const newConsultation = new Consultation({
      doctorId: parsedDoctorId,
      patientId: new mongoose.Types.ObjectId(patientId),
      nurseId: nurseId ? new mongoose.Types.ObjectId(nurseId) : null,
      type,
      notes: notes.trim(),
      consultationDate: finalDate,
      status: 'Pending',
      
      // ✅ حفظ حقول التريج والعلامات الحيوية
      triageLevel: triageLevel || 'LEVEL_3',
      triageSource: triageSource || 'SELF_REPORTED',
      vitalSigns: vitalSigns ? {
        ...vitalSigns,
        enteredBy: vitalSigns.enteredBy || 'DOCTOR'
      } : undefined,
      selfReportedSymptoms: []
    });

    await newConsultation.save();

    // ✅ 7. تسجيل التغيير الأولي في Audit Log (إذا كان هناك سبب)
    if (reason && triageLevel) {
      await TriageLog.create({
        consultationId: newConsultation._id,
        oldLevel: 'LEVEL_3',
        newLevel: triageLevel,
        changedBy: userId || parsedDoctorId,
        changedByModel: userModel || 'Doctor',
        reason: reason,
        vitalSignsSnapshot: vitalSigns || {}
      });
    }

    // ✅ 8. إنشاء الإشعارات (للطبيب، الممرض، المريض، والأدمن)
    try {
      const patientName = `${patient.firstName || ''} ${patient.lastName || patient.familyName || ''}`.trim() || 'مريض جديد';
      const doctorName = `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();

      // أ- إشعار للطبيب
      await new Notification({
        userId: parsedDoctorId,
        type: 'consultation',
        title: '📋 استشارة جديدة',
        message: `${patientName} طلب استشارة ${type === 'Instant' ? '⚡ فورية' : '📅 مجدولة'}`,
        data: {
          consultationId: newConsultation._id,
          patientId: patient._id,
          patientName: patientName,
          type: type,
          triageLevel: newConsultation.triageLevel
        },
        isRead: false
      }).save();

      // ب- إشعار للمريض (تأكيد الطلب)
      await new Notification({
        userId: new mongoose.Types.ObjectId(patientId),
        type: 'consultation_status',
        title: '✅ تم استلام طلبك',
        message: `تم تسجيل استشارتك مع د. ${doctorName} بنجاح.`,
        data: {
          consultationId: newConsultation._id,
          doctorName: doctorName,
          status: 'Pending'
        },
        isRead: false
      }).save();

      // ج- إشعار للأدمن (للمتابعة العامة)
      const admins = await Admin.find({}, '_id');
      for (const admin of admins) {
        await new Notification({
          userId: admin._id,
          type: 'system_alert',
          title: '📋 استشارة جديدة في النظام',
          message: `المريض ${patientName} قام بطلب استشارة ${type}.`,
          data: {
            consultationId: newConsultation._id,
            patientId: patientId,
            doctorId: doctorId
          },
          isRead: false
        }).save();
      }

      // د- إذا كان فيه ممرض، بعث ليه إشعار أيضاً
      if (nurseId) {
        try {
          const Nurse = require("../../models/NurseModel");
          const nurse = await Nurse.findById(nurseId);
          
          if (nurse) {
            await new Notification({
              userId: new mongoose.Types.ObjectId(nurseId),
              type: 'consultation',
              title: '📋 تم تعيينك في استشارة',
              message: `${patientName} طلب استشارة ${type === 'Instant' ? '⚡ فورية' : '📅 مجدولة'}`,
              data: {
                consultationId: newConsultation._id,
                patientId: patient._id,
                patientName: patientName,
                type: type,
                doctorName: doctorName,
                triageLevel: newConsultation.triageLevel
              },
              isRead: false
            }).save();
          }
        } catch (nurseErr) {
          console.warn("⚠️ Failed to notify nurse:", nurseErr.message);
        }
      }
    } catch (notifError) {
      console.error("⚠️ Failed to create notification:", notifError.message);
    }

    // ✅ 9. الرد الناجح مع البيانات الكاملة
    return res.status(201).json({ 
      success: true,
      message: "تمت إضافة الاستشارة بنجاح",
      data: {
        _id: newConsultation._id,
        doctorId: newConsultation.doctorId,
        patientId: newConsultation.patientId,
        type: newConsultation.type,
        triageLevel: newConsultation.triageLevel,
        vitalSigns: newConsultation.vitalSigns,
        consultationDate: newConsultation.consultationDate,
        status: newConsultation.status,
        createdAt: newConsultation.createdAt
      }
    });

  } catch (error) {
    console.error("💥 Add Consultation Error:", error.message);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: `Invalid ID format for field: ${error.path}`
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ 
        success: false,
        message: "Validation Error",
        errors: errors
      });
    }
    
    if (error.code === 11000) {
      return res.status(409).json({ 
        success: false,
        message: "Duplicate consultation entry"
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: "خطأ في السيرفر",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;