const connectDB = require("../../database/dbconnection");
const Home = require("../../models/HomeModel");
const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await connectDB();

    // ✅ جلب جميع المنشورات النشطة فقط وترتيبها حسب الأحدث
    const allAnnouncements = await Home.find({ isActive: true })
      .sort({ registeredAt: -1 });

    if (!allAnnouncements || allAnnouncements.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "لا توجد إعلانات حالياً" 
      });
    }

    // ✅ الرد بصيغة JSON صحيحة
    res.status(200).json(allAnnouncements);

  } catch (error) {
    console.error("💥 Get All Home Posts Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "خطأ في السيرفر", 
      error: error.message 
    });
  }
});

module.exports = router;