const connectDB = require("../../database/dbconnection");
const Hospital = require("../../models/hospitalModel");
const express = require("express");

const router = express.Router();

router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await connectDB();

    // ✅ التصحيح 1: استخدام findByIdAndDelete أو وضع الشرط داخل {}
    const del = await Hospital.findByIdAndDelete(id);
    
    if (!del) {
      return res.status(404).json({ 
        success: false, 
        message: "لم يتم العثور على هذا المستشفى" 
      });
    }

    // ✅ التصحيح 2: الرد بصيغة JSON
    res.status(200).json({
      success: true,
      message: "تم حذف المستشفى بنجاح"
    });

  } catch (error) {
    console.error("💥 Delete Hospital Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "خطأ في السيرفر", 
      error: error.message 
    });
  }
});

module.exports = router;