const connectDB = require("../../database/dbconnection");
const hospital = require("../../models/hospitalModel");
const express = require("express");

const router = express.Router();

// ✅ Get Total Number of Hospitals (Count Only)
router.get("/", async (req, res) => {
  connectDB();

  try {
    const count = await hospital.countDocuments(); // ✅ يعدّ الوثائق في كولكشن hospitals
    
    res.json({ 
      success: true, 
      totalHospitals: count,
      message: count === 0 ? "No hospitals found" : "Count retrieved successfully"
    });
    
  } catch (error) {
    console.error("❌ Hospital count error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get hospital count",
      error: error.message 
    });
  }
});

module.exports = router;