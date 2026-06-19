const connectDB = require("../../database/dbconnection");
const Consultation = require("../../models/ConsultationModel"); // ✅ استخدام الموديل الرسمي
const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await connectDB();
    
    // ✅ جلب عدد الاستشارات بدقة باستخدام الموديل المعرف
    const count = await Consultation.countDocuments();
    
    res.json({ 
      success: true, 
      totalConsultations: count,
      message: "Count retrieved successfully"
    });
    
  } catch (error) {
    console.error("❌ Consultation count error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get consultation count",
      error: error.message 
    });
  }
});

module.exports = router;