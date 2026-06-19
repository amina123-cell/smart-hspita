const connectDB = require("../../database/dbconnection");
const Consultation = require("../../models/ConsultationModel");
const Doctor = require("../../models/doctorModel");
const Nurse = require("../../models/NurseModel");
const express = require("express");

const router = express.Router();

router.get("/patient/:patientId", async (req, res) => {
  try {
    await connectDB();
    
    // جلب استشارات المريض مع معلومات الطبيب والممرض
    const consultations = await Consultation.find({ patientId: req.params.patientId })
      .populate('doctorId', 'firstName familyName specialization')
      .populate('nurseId', 'firstName familyName')
      .sort({ consultationDate: -1 }); // الأحدث أولاً

    // تنسيق الرد
    const formatted = consultations.map(c => ({
      _id: c._id,
      type: c.type,
      priority: c.priority,
      consultationDate: c.consultationDate,
      notes: c.notes,
      status: c.status,
      doctorName: c.doctorId ? `${c.doctorId.firstName} ${c.doctorId.familyName}` : null,
      nurseName: c.nurseId ? `${c.nurseId.firstName} ${c.nurseId.familyName}` : null
    }));

    res.json(formatted);
  } catch (error) {
    console.error("💥 Get Patient Consultations Error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;