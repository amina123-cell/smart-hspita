const connectDB = require("../../database/dbconnection");
const patient = require("../../models/patientModel");
const express = require("express");

const router = express.Router();



// ✅ Get Total Number of Patients (Count Only)
router.get("/", async (req, res) => {
  connectDB();

  try {
    const count = await patient.countDocuments(); // ✅ يعدّ الوثائق في الكولكشن
    
    res.json({ 
      success: true, 
      totalPatients: count,
      message: count === 0 ? "No patients found" : "Count retrieved successfully"
    });
    
  } catch (error) {
    console.error("❌ Count error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get patient count",
      error: error.message 
    });
  }
});

module.exports = router;

