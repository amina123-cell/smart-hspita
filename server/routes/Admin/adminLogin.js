const connectDB = require("../../database/dbconnection");
const Admin = require("../../models/AdminModel");
const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "medicare-secret-key-2026";

router.post("/", async (req, res) => {
  const { password, phoneNumber } = req.body;
  try {
    await connectDB();
    const auth = await Admin.findOne({ phoneNumber });
    if (!auth || auth.password !== password) {
      return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
    }

    const token = jwt.sign({ id: auth._id, role: "admin" }, JWT_SECRET, { expiresIn: "24h" });

    return res.json({
      message: "تم تسجيل الدخول بنجاح",
      adminId: auth._id.toString(), // ✅ مفتاح الواجهة
      _id: auth._id.toString(),
      role: "admin",
      name: `${auth.firstName || ""} ${auth.familyName || ""}`.trim(),
      token
    });
  } catch (error) {
    res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
  }
});

module.exports = router;