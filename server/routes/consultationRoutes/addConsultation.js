const connectDB = require("../../database/dbconnection");
const Consultation = require("../../models/ConsultationModel");
const Notification = require("../../models/NotificationModel");
const Patient = require("../../models/patientModel");
const Doctor = require("../../models/doctorModel");
const mongoose = require("mongoose");
const express = require("express");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    await connectDB();
    
    const { doctorId, patientId, nurseId, type, priority, notes, consultationDate } = req.body;

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

    // ✅ 6. إنشاء الاستشارة الجديدة
    const newConsultation = new Consultation({
      doctorId: parsedDoctorId,
      patientId: new mongoose.Types.ObjectId(patientId),
      nurseId: nurseId ? new mongoose.Types.ObjectId(nurseId) : null,
      type,
      priority: priority ? Number(priority) : 2,
      notes: notes.trim(),
      consultationDate: finalDate,
      status: 'Pending'
    });

    await newConsultation.save();

    // ✅ 7. إنشاء إشعار للطبيب
    try {
      const patientName = `${patient.firstName || ''} ${patient.lastName || patient.familyName || ''}`.trim() || 'مريض جديد';

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
          priority: newConsultation.priority
        },
        isRead: false
      }).save();

      // ✅ 8. إذا كان فيه ممرض، بعث ليه إشعار أيضاً
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
                doctorName: `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim()
              },
              isRead: false
            }).save();
          }
        } catch (nurseErr) {
          console.warn("⚠️ Failed to notify nurse:", nurseErr.message);
          // نستمر حتى لو فشل إشعار الممرض
        }
      }
    } catch (notifError) {
      console.error("⚠️ Failed to create notification:", notifError.message);
      // نستمر حتى لو فشل الإشعار، الأهم هو حفظ الاستشارة
    }

    // ✅ 9. الرد الناجح
    return res.status(201).json({ 
      success: true,
      message: "تمت إضافة الاستشارة بنجاح",
      data: {
        _id: newConsultation._id,
        doctorId: newConsultation.doctorId,
        patientId: newConsultation.patientId,
        type: newConsultation.type,
        priority: newConsultation.priority,
        consultationDate: newConsultation.consultationDate,
        status: newConsultation.status,
        createdAt: newConsultation.createdAt
      }
    });

  } catch (error) {
    console.error("💥 Add Consultation Error:", error.message);
    
    // ✅ معالجة أخطاء MongoDB الشائعة
    if (error.name === 'CastError' && error.path === 'doctorId') {
      return res.status(400).json({ 
        success: false,
        message: "Invalid doctor ID format"
      });
    }
    
    if (error.name === 'CastError' && error.path === 'patientId') {
      return res.status(400).json({ 
        success: false,
        message: "Invalid patient ID format"
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