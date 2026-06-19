const connectDB = require("../../database/dbconnection");
const Hospital = require("../../models/hospitalModel");
const express = require("express");

const router = express.Router();

router.post("/", async (req, res) => {
  const {
    name,
    address,
    phoneNumber,
    email,
    type,
    capacity,
    emergencyAvailable
  } = req.body;

  try {
    await connectDB();

    // ✅ التحقق من البيانات الأساسية
    if (!name || !address || !phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        message: "البيانات الأساسية ناقصة (الاسم، العنوان، الهاتف)" 
      });
    }

    // ✅ إنشاء المستشفى الجديد
    const newHospital = await Hospital.create({
      name,
      address,
      phoneNumber,
      email,
      type,
      capacity,
      emergencyAvailable: emergencyAvailable !== undefined ? emergencyAvailable : false
    });

    // ✅ الرد الصحيح بصيغة JSON
    res.status(201).json({
      success: true,
      message: "تمت إضافة المستشفى بنجاح",
      data: {
        _id: newHospital._id,
        name: newHospital.name,
        address: newHospital.address
      }
    });

  } catch (error) {
    console.error("💥 Add Hospital Error:", error.message);
    
    // ✅ معالجة أخطاء التكرار (مثلاً نفس رقم الهاتف)
    if (error.code === 11000) {
      return res.status(409).json({ 
        success: false, 
        message: "يوجد مستشفى مسجل مسبقاً بنفس رقم الهاتف" 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: "خطأ في السيرفر", 
      error: error.message 
    });
  }
});

module.exports = router;