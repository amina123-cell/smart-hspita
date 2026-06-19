const connectDB = require("../../database/dbconnection");
const Admin = require("../../models/AdminModel");
const express = require("express");

const router = express.Router();

router.put("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await connectDB();

    // ✅ التحديث باستخدام الـ ID
    const updated = await Admin.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        message: "لم يتم العثور على هذا المسؤول" 
      });
    }

    // ✅ الرد الصحيح بصيغة JSON
    res.status(200).json({
      success: true,
      message: "تم تحديث بيانات المسؤول بنجاح",
      data: updated
    });

  } catch (error) {
    console.error("💥 Update Admin Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "خطأ في السيرفر", 
      error: error.message 
    });
  }
});

module.exports = router;