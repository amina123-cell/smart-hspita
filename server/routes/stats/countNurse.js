const connectDB = require("../../database/dbconnection");
const nurse = require("../../models/NurseModel");
const express = require("express");

const router = express.Router();

// ✅ Get Total Number of Nurses (Count Only)
router.get("/", async (req, res) => {
  connectDB();

  try {
    const count = await nurse.countDocuments(); // ✅ يعدّ الوثائق في كولكشن nurses
    
    res.json({ 
      success: true, 
      totalNurses: count,
      message: count === 0 ? "No nurses found" : "Count retrieved successfully"
    });
    
  } catch (error) {
    console.error("❌ Nurse count error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get nurse count",
      error: error.message 
    });
  }
});

module.exports = router;