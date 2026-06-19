const connectDB = require("../../database/dbconnection");
const Hospital = require("../../models/hospitalModel");
const express = require("express");

const router = express.Router();

router.put("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await connectDB();

    // ✅ التصحيح: استخدام findByIdAndUpdate مباشرة بالـ ID
    const up = await Hospital.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!up) {
      return res.status(404).json({ 
        success: false, 
        message: "لم يتم العثور على هذا المستشفى" 
      });
    }

    // ✅ الرد الصحيح بصيغة JSON
    res.status(200).json({
      success: true,
      message: "تم تحديث بيانات المستشفى بنجاح",
      data: up
    });

  } catch (error) {
    console.error("💥 Update Hospital Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "خطأ في السيرفر", 
      error: error.message 
    });
  }
});

module.exports = router;