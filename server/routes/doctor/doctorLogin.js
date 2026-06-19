const connectDB = require("../../database/dbconnection");
const Doctor = require("../../models/doctorModel");
const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "medicare-secret-key-2026";

router.post("/", async (req, res) => {
  const { password, phoneNumber } = req.body;
  
  try {
    await connectDB(); // ✅ انتظار الاتصال قبل الاستعلام
    
    const auth = await Doctor.findOne({ phoneNumber });
    
    // ✅ مقارنة الباسورد (للبدء فقط، لاحقاً استعمل bcrypt)
    if (!auth || auth.password !== password) {
      return res.status(401).json({ message: "Error: Incorrect credentials" });
    }

    const token = jwt.sign(
      { id: auth._id, role: "doctor" },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "تم تسجيل الدخول بنجاح",
      token: token,
      doctorId: auth._id.toString(),   // ✅ أساسي للواجهة
      _id: auth._id.toString(),
      role: "doctor",
      // ✅ التصحيح: استخدام lastName حيت هو الموجود فـ الموديل
      name: `${auth.firstName || ""} ${auth.lastName || ""}`.trim()
    });

  } catch (error) {
    console.error("💥 Doctor Login Error:", error.message);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;