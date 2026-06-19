const connectDB = require("../../database/dbconnection");
const Doctor = require("../../models/doctorModel");
const express = require("express");

const router = express.Router();

// ❌ حيدنا router.use(express.json()) من هنا حيت موجودة ديجا فـ server.js
// وجودها مرتين ما كتسببش خطأ، ولكن الأفضل تكون فـ مكان واحد

router.post("/", async (req, res) => {
  try {
    // ✅ انتظار الاتصال بالداتابيز قبل الاستعلام
    await connectDB();

    const {
      password, firstName, lastName, dateOfBirth, gender, phoneNumber,
      email, address, profilePicture, licenseNumber, specializations,
      experience, department, hospitalId, consultationFee
    } = req.body;

    // ✅ تحقق بسيط من الحقول الإجبارية
    if (!password || !firstName || !lastName || !phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        message: "بيانات أساسية ناقصة (كلمة السر، الاسم، اللقب، الهاتف)" 
      });
    }

    // ✅ إنشاء الطبيب
    const newDoctor = await Doctor.create({
      password, firstName, lastName, dateOfBirth, gender, phoneNumber,
      email, address, profilePicture, licenseNumber, specializations,
      experience, department, hospitalId, consultationFee,
      registeredAt: new Date(),
      isActive: true
    });

    // ✅ رد JSON صحيح مع إرجاع _id (ضروري للواجهة والاستشارات)
    res.status(201).json({
      success: true,
      message: "تمت إضافة الطبيب بنجاح",
      data: {
        _id: newDoctor._id,           // ✅ هذا هو اللي كتنقز عليه الواجهة
        firstName: newDoctor.firstName,
        lastName: newDoctor.lastName,
        phoneNumber: newDoctor.phoneNumber,
        department: newDoctor.department
      }
    });

  } catch (error) {
    console.error("💥 Add Doctor Error:", error.message);
    
    // ✅ معالجة أخطاء الداتابيز الشائعة
    if (error.code === 11000) {
      return res.status(409).json({ 
        success: false, 
        message: "يوجد طبيب مسجل مسبقاً بنفس رقم الهاتف أو البريد الإلكتروني" 
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