 //server/routes/patientRoutes/patientLogin.js
const connectDB = require("../../database/dbconnection");
const Patient = require("../../models/patientModel");

const path = require('path');
// ✅ هاد السطر غادي يخدم فـ Windows و Linux (Render) بلا مشاكل
const Patient = require(path.join(__dirname, '..', '..', 'models', 'PatientModel'));
const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();
router.use(express.json());
const JWT_SECRET = process.env.JWT_SECRET || "medicare-secret-key-2026";

router.post("/", async (req, res) => {
  const { password, phoneNumber } = req.body;
  connectDB();

  try {
    const patient = await Patient.findOne({ phoneNumber });
    if (!patient || patient.password !== password) {
      return res.status(401).json({ message: "Error: Incorrect credentials" });
    }

    const token = jwt.sign({ id: patient._id, role: "patient" }, JWT_SECRET, { expiresIn: "24h" });

    return res.status(200).json({
      message: "تم تسجيل الدخول بنجاح",
      token: token,
      patientId: patient._id.toString(),  // ✅ idKey: "patientId"
      _id: patient._id.toString(),
      role: "patient",
      name: `${patient.firstName || ""} ${patient.familyName || ""}`.trim()
    });

  } catch (error) {
    console.error("💥 Patient Login Error:", error.message);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;