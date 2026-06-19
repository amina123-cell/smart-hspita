const connectDB = require("../../database/dbconnection");
const doctor = require("../../models/doctorModel");
const express = require("express");

const router = express.Router();

// ✅ Get Total Number of Doctors (Count Only)
router.get("/", async (req, res) => {
  connectDB();

  try {
    const count = await doctor.countDocuments(); // ✅ يعدّ الوثائق في كولكشن doctors
    
    res.json({ 
      success: true, 
      totalDoctors: count,
      message: count === 0 ? "No doctors found" : "Count retrieved successfully"
    });
    
  } catch (error) {
    console.error("❌ Doctor count error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get doctor count",
      error: error.message 
    });
  }
});

module.exports = router;