const connectDB = require("../../database/dbconnection");
const admin = require("../../models/AdminModel");
const express = require("express");

const router = express.Router();

// ✅ Get Total Number of Admins (Count Only)
router.get("/", async (req, res) => {
  connectDB();

  try {
    const count = await admin.countDocuments(); // ✅ يعدّ الوثائق في كولكشن admins
    
    res.json({ 
      success: true, 
      totalAdmins: count,
      message: count === 0 ? "No admins found" : "Count retrieved successfully"
    });
    
  } catch (error) {
    console.error("❌ Admin count error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get admin count",
      error: error.message 
    });
  }
});

module.exports = router;