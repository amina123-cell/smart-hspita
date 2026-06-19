const connectDB = require("../../database/dbconnection");
const Doctor = require("../../models/doctorModel");
const express = require("express");

const router = express.Router();
// ✅ حيدنا express.json() من هنا حيت موجودة فـ server.js

router.get("/:id", async (req, res) => {
  try {
    await connectDB();
    
    // ✅ التصحيح 1: findById ماشي findByIdAndDelete
    const doctor = await Doctor.findById(req.params.id).select("-password");
    
    if (!doctor) {
      // ✅ التصحيح 2: نرجعو JSON ماشي نص عادي
      return res.status(404).json({ message: "Doctor not found" });
    }
    
    res.json(doctor);
  } catch (error) {
    console.error("💥 Get Doctor Error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;