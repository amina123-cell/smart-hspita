const connectDB = require("../../database/dbconnection");
const Hospital = require("../../models/hospitalModel");
const express = require("express");

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    await connectDB();

    const id = req.params.id;

    // ✅ جلب المستشفى بالمعرف
    const getHospital = await Hospital.findById(id);

    if (!getHospital) {
      return res.status(404).json({ 
        success: false, 
        message: "لم يتم العثور على هذا المستشفى" 
      });
    }

    // ✅ الرد بصيغة JSON صحيحة
    res.status(200).json(getHospital);

  } catch (error) {
    console.error("💥 Get Single Hospital Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "خطأ في السيرفر", 
      error: error.message 
    });
  }
});

module.exports = router;