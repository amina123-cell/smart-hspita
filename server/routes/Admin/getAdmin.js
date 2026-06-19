const connectDB = require("../../database/dbconnection");
const Admin = require("../../models/AdminModel");
const express = require("express");

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    await connectDB();
    const admin = await Admin.findById(req.params.id).select("-password");
    if (!admin) return res.status(404).json({ message: "المسؤول غير موجود" });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
  }
});

module.exports = router;