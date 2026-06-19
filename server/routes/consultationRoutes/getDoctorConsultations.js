const connectDB = require("../../database/dbconnection");
const Consultation = require("../../models/ConsultationModel");
const express = require("express");

const router = express.Router();

// ✅ GET: جلب استشارات طبيب محدد
router.get("/doctor/:doctorId", async (req, res) => {
  try {
    await connectDB();
    const { doctorId } = req.params;

    // .populate يجلب اسم المريض ورقم هاتفه بدلاً من الـ ID فقط
    const consultations = await Consultation.find({ doctorId })
      .populate('patientId', 'firstName familyName phoneNumber') 
      .sort({ createdAt: -1 }); // الأحدث أولاً

    res.json({ 
      success: true, 
      data: consultations 
    });

  } catch (error) {
    console.error("💥 Get Doctor Consultations Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server Error", 
      error: error.message 
    });
  }
});

module.exports = router;