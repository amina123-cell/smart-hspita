const connectDB = require("../../database/dbconnection");
const Patient = require("../../models/PatientModel"); // ✅ تأكد من اسم الملف: PatientModel.js أو patientModel.js
const express = require("express");

const router = express.Router();
// ✅ حيدنا express.json() من هنا حيت موجودة فـ server.js

router.delete("/:id", async (req, res) => {
  try {
    await connectDB();
    
    // ✅ الحذف بـ _id ديال MongoDB
    const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
    
    if (!deletedPatient) {
      // ✅ التصحيح 1: نرجعو JSON + status code + return
      return res.status(404).json({ message: "Patient not found" });
    }
    
    // ✅ التصحيح 2: نرجعو رد ناجح كـ JSON
    return res.status(200).json({ message: "Patient deleted successfully" });
    
  } catch (error) {
    console.error("💥 Delete Patient Error:", error.message);
    // ✅ التصحيح 3: نرجعو خطأ كـ JSON
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;