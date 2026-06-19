const connectDB = require("../../database/dbconnection");
const Admin = require("../../models/AdminModel");
const bcrypt = require("bcryptjs"); // ✅ مكتبة التشفير الآمن
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
    department,
    role,
    permissions
  } = req.body;

  try {
    await connectDB();

    // ✅ 1. التحقق من البيانات الأساسية
    if (!password || !firstName || !familyName || !phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        message: "البيانات الأساسية ناقصة (كلمة السر، الاسم، اللقب، الهاتف)" 
      });
    }

    // ✅ 2. تشفير الباسورد قبل الحفظ (خطوة أمنية إلزامية)
    const hashedPassword = await bcrypt.hash(password, 12);

    // ✅ 3. إنشاء المسؤول الجديد بالباسورد المشفر
    const newAdmin = await Admin.create({
      password: hashedPassword,
      firstName,
      familyName,
      phoneNumber,
      address,
      profilePicture,
      department,
      role: role || 'admin',
      permissions: Array.isArray(permissions) ? permissions : [],
      isActive: true
    });

    // ✅ 4. الرد الناجح (بدون إرجاع أي بيانات حساسة)
    res.status(201).json({
      success: true,
      message: "تمت إضافة المسؤول بنجاح",
      data: {
        _id: newAdmin._id,
        firstName: newAdmin.firstName,
        familyName: newAdmin.familyName,
        role: newAdmin.role,
        department: newAdmin.department
      }
    });

  } catch (error) {
    console.error(" Add Admin Error:", error.message);
    
    // ✅ معالجة أخطاء التكرار (رقم الهاتف أو الإيميل)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ 
        success: false, 
        message: `يوجد مسؤول مسجل مسبقاً بنفس ${field === 'phoneNumber' ? 'رقم الهاتف' : 'البريد الإلكتروني'}` 
      });
    }

    // ✅ معالجة أخطاء التحقق من الموديل
    if (error.name === 'ValidationError') {
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ 
        success: false, 
        message: "خطأ في التحقق من البيانات",
        errors 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: "خطأ في السيرفر", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;