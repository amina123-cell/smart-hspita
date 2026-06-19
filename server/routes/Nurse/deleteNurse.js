const connectDB = require("../../database/dbconnection");
const Nurse = require("../../models/nurseModel");
const express = require("express");

const router = express.Router();
// ✅ حيدنا express.json() من هنا حيت موجودة فـ server.js

router.delete("/:id", async (req, res) => {
  try {
    await connectDB();
    
    // ✅ التصحيح 1: نستخدم req.params.id ( ماشي userId )
    // ✅ التصحيح 2: نستخدم findByIdAndDelete مع الـ _id ديال مونقو
    const deletedNurse = await Nurse.findByIdAndDelete(req.params.id);
    
    if (!deletedNurse) {
      // ✅ التصحيح 3: نرجعو JSON ماشي نص عادي
      return res.status(404).json({ message: "Nurse not found" });
    }
    
    // ✅ نرجعو رد ناجح كـ JSON
    res.status(200).json({ message: "Nurse deleted successfully" });
    
  } catch (error) {
    console.error("💥 Delete Nurse Error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;