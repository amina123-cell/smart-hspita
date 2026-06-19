const connectDB = require("../../database/dbconnection");
const Patient = require("../../models/patientModel");
const express = require("express");

const router = express.Router();

router.put("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await connectDB();

    // ✅ التصحيح: استخدام findByIdAndUpdate مباشرة بالـ ID
    const up = await Patient.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!up) {
      return res.status(404).json({ 
        success: false, 
        message: "لم يتم العثور على هذا المريض" 
      });
    }

    // ✅ الرد الصحيح بصيغة JSON
    res.status(200).json({
      success: true,
      message: "تم تحديث بيانات المريض بنجاح",
      data: up
    });

  } catch (error) {
    console.error("💥 Update Patient Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "خطأ في السيرفر", 
      error: error.message 
    });
  }
});

module.exports = router;