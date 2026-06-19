const connectDB = require("../../database/dbconnection");
const Hospital = require("../../models/hospitalModel");
const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await connectDB();

    // ✅ جلب جميع المستشفيات
    const getHospitals = await Hospital.find();

    if (!getHospitals || getHospitals.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "لا توجد مستشفيات في قاعدة البيانات" 
      });
    }

    // ✅ الرد بصيغة JSON صحيحة
    res.status(200).json(getHospitals);

  } catch (error) {
    console.error("💥 Get All Hospitals Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "خطأ في السيرفر", 
      error: error.message 
    });
  }
});

module.exports = router;