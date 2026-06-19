const connectDB = require("../../database/dbconnection");
const Doctor = require("../../models/doctorModel");
const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await connectDB();

    // ✅ جلب جميع الأطباء واستثناء كلمة السر للأمان
    const doctors = await Doctor.find().select("-password");

    if (!doctors || doctors.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "لا يوجد أطباء في قاعدة البيانات" 
      });
    }

    // ✅ الرد بصيغة JSON صحيحة
    res.status(200).json(doctors);

  } catch (error) {
    console.error("💥 Get All Doctors Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "خطأ في السيرفر", 
      error: error.message 
    });
  }
});

module.exports = router;