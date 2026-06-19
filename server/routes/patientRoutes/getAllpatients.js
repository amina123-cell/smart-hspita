const connectDB = require("../../database/dbconnection");
const Patient = require("../../models/patientModel"); // ✅ تأكد من تطابق اسم الملف (PatientModel أو patientModel)
const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await connectDB();

    // ✅ جلب جميع المرضى واستثناء كلمة السر للأمان
    const getPatients = await Patient.find().select("-password");

    if (!getPatients || getPatients.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "لا يوجد مرضى في قاعدة البيانات" 
      });
    }

    // ✅ الرد بصيغة JSON صحيحة
    res.status(200).json(getPatients);

  } catch (error) {
    console.error("💥 Get All Patients Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "خطأ في السيرفر", 
      error: error.message 
    });
  }
});

module.exports = router;