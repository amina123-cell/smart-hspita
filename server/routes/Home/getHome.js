const connectDB = require("../../database/dbconnection");
const Home = require("../../models/HomeModel");
const express = require("express");

const router = express.Router();

// ✅ التصحيح 1: استخدام /:id باش يتطابق مع req.params.id
router.get("/:id", async (req, res) => {
  try {
    await connectDB();

    const id = req.params.id;
    
    // ✅ جلب المنشور بالمعرف
    const announcement = await Home.findById(id);

    if (!announcement) {
      return res.status(404).json({ 
        success: false, 
        message: "لم يتم العثور على هذا المنشور" 
      });
    }

    // ✅ الرد بصيغة JSON صحيحة
    res.status(200).json(announcement);

  } catch (error) {
    console.error("💥 Get Single Home Post Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "خطأ في السيرفر", 
      error: error.message 
    });
  }
});

module.exports = router;