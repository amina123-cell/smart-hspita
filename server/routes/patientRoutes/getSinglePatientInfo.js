const connectDB = require("../../database/dbconnection");
const Patient = require("../../models/patientModel"); // ✅ حرف كبير 'P'
const express = require("express");

const router = express.Router();
// ✅ حيدنا express.json() من هنا حيت موجودة فـ server.js

router.get("/:id", async (req, res) => {
  try {
    await connectDB();
    
    // ✅ التصحيح 1: Patient (كبير) + findById (صغير) + select("-password")
    const patient = await Patient.findById(req.params.id).select("-password");
    
    if (!patient) {
      // ✅ التصحيح 2: نرجعو JSON ماشي نص عادي
      return res.status(404).json({ message: "Patient not found" });
    }
    
    res.json(patient);
  } catch (error) {
    console.error("💥 Get Patient Error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;