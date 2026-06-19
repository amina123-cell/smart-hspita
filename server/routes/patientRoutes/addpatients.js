const connectDB = require("../../database/dbconnection");
const Patient = require("../../models/patientModel");
const express = require("express");

const router = express.Router();

router.post("/", async (req, res) => {
  const {
    password,
    firstName,
    familyName,
    dateOfBirth,
    gender,
    phoneNumber,
    address,
    hasSocialSecurityCard,
    socialSecurityNumber,
    insuranceType,
    insuranceStatus,
    coveragePercentage,
    bloodGroup,
    chronicDiseases,
    allergies,
    emergencyContactName,
    emergencyContactPhone
  } = req.body;

  try {
    await connectDB();

    // ✅ التحقق من البيانات الأساسية
    if (!password || !firstName || !familyName || !phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        message: "البيانات الأساسية ناقصة (كلمة السر، الاسم، اللقب، الهاتف)" 
      });
    }

    // ✅ إنشاء المريض الجديد (حذفت حقل id حيت MongoDB كيعطيه أوتوماتيكياً)
    const newPatient = await Patient.create({
      password,
      firstName,
      familyName,
      dateOfBirth,
      gender,
      phoneNumber,
      address,
      hasSocialSecurityCard,
      socialSecurityNumber,
      insuranceType,
      insuranceStatus,
      coveragePercentage,
      bloodGroup,
      chronicDiseases,
      allergies,
      emergencyContactName,
      emergencyContactPhone
    });

    // ✅ الرد الصحيح بصيغة JSON
    res.status(201).json({
      success: true,
      message: "تمت إضافة المريض بنجاح",
      data: {
        _id: newPatient._id,
        firstName: newPatient.firstName,
        familyName: newPatient.familyName,
        phoneNumber: newPatient.phoneNumber
      }
    });

  } catch (error) {
    console.error("💥 Add Patient Error:", error.message);
    
    // ✅ معالجة أخطاء التكرار (مثلاً نفس رقم الهاتف)
    if (error.code === 11000) {
      return res.status(409).json({ 
        success: false, 
        message: "يوجد مريض مسجل مسبقاً بنفس رقم الهاتف" 
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