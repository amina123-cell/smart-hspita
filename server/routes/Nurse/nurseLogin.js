const connectDB = require("../../database/dbconnection");
const Nurse = require("../../models/NurseModel"); // ⚠️ تأكد: NurseModel.js أو nurseModel.js حسب مشروعك
const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();
router.use(express.json());

// ✅ مفتاح التوكن (حطو فـ .env فـ الإنتاج)
const JWT_SECRET = process.env.JWT_SECRET || "medicare-secret-key-2026";

router.post("/", async (req, res) => {
  const { password, phoneNumber } = req.body;
  connectDB();

  try {
    // 🔍 البحث عن الممرض برقم الهاتف فقط (البحث بالباسورد كيجي بعد)
    const nurse = await Nurse.findOne({ phoneNumber });

    // ✅ التحقق من وجود الممرض وصحة الباسورد
    // ⚠️ ملاحظة: المقارنة هنا كنص عادي (للبدء فقط). لاحقاً استعمل bcrypt
    if (!nurse || nurse.password !== password) {
      return res.status(401).json({ message: "Error: Incorrect credentials" });
    }

    // ✅ إنشاء توكن الجلسة
    const token = jwt.sign(
      { id: nurse._id, role: "nurse" },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // ✅ الرد النهائي: متوافق 100% مع Login.jsx
    return res.status(200).json({
      message: "تم تسجيل الدخول بنجاح",
      token: token,                      // ✅ التوكن للطلبات المستقبلية
      nurseId: nurse._id.toString(),     // ✅ هذا هو اللي كتنقز عليه الواجهة (idKey: "nurseId")
      _id: nurse._id.toString(),         // ✅ نسخة إضافية للتوافق
      role: "nurse",                     // ✅ الدور
      name: `${nurse.firstName || ""} ${nurse.familyName || ""}`.trim() // ✅ الاسم للعرض فـ الهيدر
    });

  } catch (error) {
    console.error("💥 Nurse Login Error:", error.message);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;