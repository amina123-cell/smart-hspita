const connectDB = require("../../database/dbconnection");
const Nurse = require("../../models/NurseModel"); // ✅ تأكد من اسم الملف عندك
const express = require("express");

const router = express.Router();
// ✅ حيدنا express.json() من هنا حيت موجودة فـ server.js

router.get("/:id", async (req, res) => {
  try {
    await connectDB();
    
    // ✅ التصحيح 1: نستخدم findById مع :id (اللي هو req.params.id)
    const nurse = await Nurse.findById(req.params.id).select("-password");
    
    if (!nurse) {
      // ✅ التصحيح 2: نرجعو JSON ماشي نص عادي
      return res.status(404).json({ message: "Nurse not found" });
    }
    
    res.json(nurse);
  } catch (error) {
    console.error("💥 Get Nurse Error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;