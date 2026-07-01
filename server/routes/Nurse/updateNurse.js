const connectDB = require("../../database/dbconnection");
const Nurse = require("../../models/NurseModel");
const express = require("express");

const router = express.Router();

router.put("/:id", async (req, res) => {
  // ✅ التصحيح 1: استخدام req.params.id حيت هو الموجود فـ المسار
  const id = req.params.id;

  try {
    await connectDB();

    // ✅ التصحيح 2: استخدام findByIdAndUpdate مباشرة بالـ ID
    const up = await Nurse.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!up) {
      return res.status(404).json({ 
        success: false, 
        message: "لم يتم العثور على هذا الممرض" 
      });
    }

    // ✅ الرد الصحيح بصيغة JSON
    res.status(200).json({
      success: true,
      message: "تم تحديث بيانات الممرض بنجاح",
      data: up
    });

  } catch (error) {
    console.error("💥 Update Nurse Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "خطأ في السيرفر", 
      error: error.message 
    });
  }
});

module.exports = router;