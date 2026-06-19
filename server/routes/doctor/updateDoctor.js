const connectDB = require("../../database/dbconnection");
const Doctor = require("../../models/doctorModel");
const express = require("express");

const router = express.Router();

router.put("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await connectDB();

    // ✅ التصحيح: استخدام findByIdAndUpdate مباشرة بالـ ID
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ 
        success: false, 
        message: "لم يتم العثور على هذا الطبيب" 
      });
    }

    // ✅ الرد الصحيح بصيغة JSON
    res.status(200).json({
      success: true,
      message: "تم تحديث بيانات الطبيب بنجاح",
      data: updatedDoctor
    });

  } catch (error) {
    console.error("💥 Update Doctor Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "خطأ في السيرفر", 
      error: error.message 
    });
  }
});

module.exports = router;