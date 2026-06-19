const connectDB = require("../../database/dbconnection");
const Home = require("../../models/HomeModel");
const express = require("express");

const router = express.Router();

router.post("/", async (req, res) => {
  const {
    title,
    content,
    type,
    priority,
    targetAudience,
    startDate,
    endDate,
    isActive,
    createdBy
  } = req.body;

  try {
    await connectDB();

    // ✅ التحقق من البيانات الأساسية
    if (!title || !content || !type) {
      return res.status(400).json({ 
        success: false, 
        message: "البيانات الأساسية ناقصة (العنوان، المحتوى، النوع)" 
      });
    }

    // ✅ إنشاء المنشور الجديد (حذفت حقل id حيت MongoDB كيعطيه أوتوماتيكياً)
    const newHome = await Home.create({
      title,
      content,
      type,
      priority,
      targetAudience,
      startDate,
      endDate,
      isActive: isActive !== undefined ? isActive : true,
      createdBy
    });

    // ✅ الرد الصحيح بصيغة JSON
    res.status(201).json({
      success: true,
      message: "تمت إضافة المنشور بنجاح",
      data: {
        _id: newHome._id,
        title: newHome.title,
        type: newHome.type
      }
    });

  } catch (error) {
    console.error("💥 Add Home Post Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "خطأ في السيرفر", 
      error: error.message 
    });
  }
});

module.exports = router;