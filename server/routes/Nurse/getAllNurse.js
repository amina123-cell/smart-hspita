const connectDB = require("../../database/dbconnection");
const Nurse = require("../../models/NurseModel");
const express = require("express");

const router = express.Router();
// ✅ حيدنا express.json() من هنا حيت موجودة فـ server.js

router.get("/", async (req, res) => {
  try {
    await connectDB();
    const nurses = await Nurse.find().select("-password"); // ✅ نجيبو اللائحة بلا باسوورد

    // ✅ التصحيح: نرجعو مصفوفة فارغة إذا ما كاين والو، ماشي نص عادي
    res.json(nurses || []);
    
  } catch (error) {
    console.error("💥 Get Nurses Error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;