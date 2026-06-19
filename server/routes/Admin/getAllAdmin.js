const connectDB = require("../../database/dbconnection");
const Admin = require("../../models/AdminModel");
const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await connectDB();

    // ✅ التصحيح 1: استخدام find() لجلب اللائحة، و select("-password") للأمان
    const getAdmins = await Admin.find().select("-password");

    if (!getAdmins || getAdmins.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "لا يوجد مسؤولين في قاعدة البيانات" 
      });
    }

    // ✅ الرد بصيغة JSON صحيحة
    res.status(200).json(getAdmins);

  } catch (error) {
    console.error("💥 Get All Admins Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "خطأ في السيرفر", 
      error: error.message 
    });
  }
});

module.exports = router;