const connectDB = require("../../database/dbconnection");
const Nurse = require("../../models/NurseModel");
const express = require("express");

const router = express.Router();

router.post("/", async (req, res) => {
  const {
    password,
    firstName,
    familyName,
    phoneNumber,
    address,
    profilePicture,
    licenseNumber,
    department,
    shiftPreference,
    skills,
    supervisor,
    assignedPatients
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

    // ✅ إنشاء الممرض الجديد (حذفت userId و registeredAt حيت الموديل كيديرهم أوتوماتيكياً)
    const newNurse = await Nurse.create({
      password,
      firstName,
      familyName,
      phoneNumber,
      address,
      profilePicture,
      licenseNumber,
      department,
      shiftPreference,
      skills,
      supervisor,
      assignedPatients,
      isActive: true
    });

    // ✅ الرد الصحيح بصيغة JSON
    res.status(201).json({
      success: true,
      message: "تمت إضافة الممرض بنجاح",
      data: {
        _id: newNurse._id,
        firstName: newNurse.firstName,
        familyName: newNurse.familyName,
        department: newNurse.department
      }
    });

  } catch (error) {
    console.error("💥 Add Nurse Error:", error.message);
    
    // ✅ معالجة أخطاء التكرار (مثلاً نفس رقم الهاتف)
    if (error.code === 11000) {
      return res.status(409).json({ 
        success: false, 
        message: "يوجد ممرض مسجل مسبقاً بنفس رقم الهاتف" 
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